const BASE = "http://localhost:5059/api";

const results = [];
const createdPosts = [];
let testToken;
let buyerToken;
let sellerToken;
let adminToken;
let sellerContextPromise;

const timestamp = Date.now();
const randomDigits = Math.floor(Math.random() * 100_000_000)
  .toString()
  .padStart(8, "0");
const testAccount = {
  hoTen: "Tài khoản kiểm thử API",
  email: `test+${timestamp}@test.local`,
  soDienThoai: `09${randomDigits}`,
  matKhau: "Test@123",
  ngaySinh: "2000-01-01",
  gioiTinh: "Nam",
};

class SmokeFailure extends Error {
  constructor(request, status, message) {
    super(message);
    this.request = request;
    this.status = status;
  }
}

function oneLine(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .trim();
}

function bodySummary(body, text) {
  if (body && typeof body === "object") {
    const message = body.message ?? body.title ?? body.error;
    if (message) return oneLine(message);
    return oneLine(JSON.stringify(body));
  }
  return oneLine(text) || "(rỗng)";
}

async function request(path, { method = "GET", token, body, form } = {}) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (error) {
    throw new SmokeFailure(`${method} ${path}`, "N/A", error.message);
  }

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return {
    method,
    path,
    status: response.status,
    body: parsed,
    text,
    message: bodySummary(parsed, text),
  };
}

function expectStatus(response, expected) {
  if (response.status !== expected) {
    throw new SmokeFailure(
      `${response.method} ${response.path}`,
      response.status,
      `mong đợi HTTP ${expected}; thực tế ${response.message}`,
    );
  }
}

function expectCondition(condition, response, reason) {
  if (!condition) {
    throw new SmokeFailure(
      response ? `${response.method} ${response.path}` : "Kiểm tra dữ liệu",
      response?.status ?? "N/A",
      `${reason}; thực tế: ${response?.message ?? "(không có phản hồi)"}`,
    );
  }
}

async function check(code, description, action) {
  try {
    const detail = await action();
    results.push({ code, passed: true });
    console.log(`[PASS] ${code} - ${description}${detail ? ` - ${oneLine(detail)}` : ""}`);
  } catch (error) {
    const requestInfo = error instanceof SmokeFailure ? error.request : "không xác định";
    const status = error instanceof SmokeFailure ? error.status : "N/A";
    const message = error?.message ?? String(error);
    results.push({ code, passed: false });
    console.log(
      `[FAIL] ${code} - ${description} - (request=${oneLine(requestInfo)}; status=${status}; message=${oneLine(message)})`,
    );
  }
}

async function login(email, matKhau) {
  const response = await request("/auth/dang-nhap", {
    method: "POST",
    body: { email, matKhau },
  });
  expectStatus(response, 200);
  const token = response.body?.token;
  if (!token) {
    throw new SmokeFailure(
      `POST /auth/dang-nhap`,
      response.status,
      `phản hồi không có token; thực tế ${response.message}`,
    );
  }
  return token;
}

async function uploadAnh(token) {
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/png" }), "test.png");
  const response = await request("/bai-dang/tep", { method: "POST", token, form });
  expectStatus(response, 200);
  if (!response.body?.duongDan) {
    throw new SmokeFailure(
      `POST /bai-dang/tep`,
      response.status,
      `không có duongDan; thực tế ${response.message}`,
    );
  }
  return response.body.duongDan;
}

function findCategory(categories, name) {
  for (const category of categories ?? []) {
    if (category.tenDanhMuc === name) return category;
    const child = findCategory(category.danhMucCons, name);
    if (child) return child;
  }
  return null;
}

async function taoTin(token, idDanhMuc, tieuDe) {
  const attrsResponse = await request(`/danh-muc/${idDanhMuc}/thuoc-tinh`);
  expectStatus(attrsResponse, 200);
  const attributes = [...(attrsResponse.body ?? [])].sort(
    (a, b) => a.thuTu - b.thuTu || a.id - b.id,
  );
  const values = new Map();
  const thuocTinhs = [];

  for (const attribute of attributes) {
    if (attribute.kieuDuLieu === "So") {
      const giaTri = attribute.tenThuocTinh?.includes("Năm") ? "2020" : "1000";
      values.set(attribute.id, giaTri);
      thuocTinhs.push({ idThuocTinh: attribute.id, giaTri });
      continue;
    }

    if (attribute.kieuDuLieu !== "LuaChon") continue;
    let options = attribute.danhSachLuaChon ?? [];
    if (attribute.idThuocTinhCha != null) {
      const parentValue = values.get(attribute.idThuocTinhCha);
      options = options.filter(
        (option) => String(option.idGiaTriCha) === String(parentValue),
      );

      if (options.length === 0 && parentValue != null) {
        const dependentResponse = await request(
          `/danh-muc/${idDanhMuc}/thuoc-tinh?idHang=${encodeURIComponent(parentValue)}`,
        );
        expectStatus(dependentResponse, 200);
        const dependentAttribute = (dependentResponse.body ?? []).find(
          (item) => item.id === attribute.id,
        );
        options = (dependentAttribute?.danhSachLuaChon ?? []).filter(
          (option) => String(option.idGiaTriCha) === String(parentValue),
        );
      }
    }

    const selected = options[0];
    if (!selected) {
      if (attribute.batBuoc) {
        throw new SmokeFailure(
          `GET /danh-muc/${idDanhMuc}/thuoc-tinh`,
          attrsResponse.status,
          `không có lựa chọn phù hợp cho thuộc tính bắt buộc "${attribute.tenThuocTinh}"`,
        );
      }
      continue;
    }

    values.set(attribute.id, selected.giaTri);
    thuocTinhs.push({ idThuocTinh: attribute.id, giaTri: selected.giaTri });
  }

  const categoriesResponse = await request("/danh-muc");
  expectStatus(categoriesResponse, 200);
  const laptop = findCategory(categoriesResponse.body, "Laptop");
  if (!laptop || laptop.id !== idDanhMuc) {
    throw new SmokeFailure(
      "GET /danh-muc",
      categoriesResponse.status,
      `không tìm thấy danh mục con Laptop với id=${idDanhMuc}`,
    );
  }

  const citiesResponse = await request("/dia-chi/thanh-pho");
  expectStatus(citiesResponse, 200);
  const idThanhPho = citiesResponse.body?.[0]?.id;
  if (!idThanhPho) {
    throw new SmokeFailure(
      "GET /dia-chi/thanh-pho",
      citiesResponse.status,
      "không có thành phố để tạo tin",
    );
  }

  const duongDan = await uploadAnh(token);
  const createResponse = await request("/bai-dang", {
    method: "POST",
    token,
    body: {
      idDanhMuc,
      tieuDe,
      moTa: `Mô tả kiểm thử tự động ${tieuDe}`,
      gia: 10_000_000,
      coThuongLuong: false,
      giaChotNhanh: false,
      idThanhPho,
      idPhuongXa: null,
      diaChiChiTiet: "Địa chỉ kiểm thử",
      soDienThoaiLienHe: testAccount.soDienThoai,
      choPhepChat: true,
      danhSachHinhAnh: [{ duongDan, laVideo: false, laAnhBia: true }],
      thuocTinhs,
    },
  });
  if (createResponse.status === 201 && createResponse.body?.id) {
    createdPosts.push({ id: createResponse.body.id, tieuDe });
  }
  return createResponse;
}

async function getTestToken() {
  if (testToken) return testToken;
  testToken = await login(testAccount.email, testAccount.matKhau);
  return testToken;
}

async function getBuyerToken() {
  if (!buyerToken) buyerToken = await login("nguoimua@chodocu.local", "User@123");
  return buyerToken;
}

async function getSellerContext() {
  if (!sellerContextPromise) {
    sellerContextPromise = (async () => {
      sellerToken = await login("nguoiban1@chodocu.local", "User@123");
      const list = await request("/bai-dang/cua-toi?trangThai=DaDuyet&pageSize=50", {
        token: sellerToken,
      });
      expectStatus(list, 200);
      const post = list.body?.items?.[0];
      if (!post) {
        throw new SmokeFailure(
          "GET /bai-dang/cua-toi?trangThai=DaDuyet&pageSize=50",
          list.status,
          "nguoiban1 không có tin DaDuyet để kiểm tra phân quyền",
        );
      }

      const detail = await request(`/bai-dang/${post.id}`, { token: sellerToken });
      expectStatus(detail, 200);
      const item = detail.body;
      let media = item.danhSachMedia;
      if (!Array.isArray(media) || media.length === 0) {
        media = (item.anhs ?? []).map((duongDan) => ({ duongDan, laVideo: false }));
      }
      media = media.map((image) => ({
        duongDan: image.duongDan,
        laVideo: Boolean(image.laVideo),
        laAnhBia: false,
      }));
      const coverIndex = media.findIndex((image) => !image.laVideo);
      if (coverIndex >= 0) media[coverIndex].laAnhBia = true;

      return {
        postId: post.id,
        updateBody: {
          idDanhMuc: item.idDanhMuc,
          tieuDe: item.tieuDe,
          moTa: item.noiDung,
          gia: item.giaTien,
          coThuongLuong: item.coThuongLuong ?? false,
          giaChotNhanh: item.giaChotNhanh ?? false,
          idThanhPho: item.idThanhPho,
          idPhuongXa: item.idPhuongXa ?? null,
          diaChiChiTiet: item.diaChiChiTiet ?? "",
          soDienThoaiLienHe: item.soDienThoaiLienHe ?? "",
          choPhepChat: item.choPhepChat ?? true,
          danhSachHinhAnh: media,
          thuocTinhs: item.thuocTinhsDeSua ?? [],
        },
      };
    })();
  }
  return sellerContextPromise;
}

function items(response) {
  return Array.isArray(response.body?.items) ? response.body.items : [];
}

function latestFiveSummary(list) {
  return items(list)
    .slice(0, 5)
    .map((post, index) => ({
      viTri: index + 1,
      id: post.id,
      tieuDe: post.tieuDe,
      ngayDayTin: post.ngayDayTin ?? null,
      laTinUuTien: Boolean(post.laTinUuTien),
    }));
}

await check("6.1", "Đăng ký tài khoản mới thành công", async () => {
  const response = await request("/auth/dang-ky", {
    method: "POST",
    body: testAccount,
  });
  expectStatus(response, 201);
  testToken = response.body?.token;
  return `email=${testAccount.email}`;
});

await check("6.2", "Hồ sơ mới có luotDang=3 và luotDay=0", async () => {
  const token = await getTestToken();
  const response = await request("/nguoi-dung/me", { token });
  expectStatus(response, 200);
  expectCondition(
    response.body?.luotDang === 3 && response.body?.luotDay === 0,
    response,
    `mong đợi luotDang=3, luotDay=0; nhận luotDang=${response.body?.luotDang}, luotDay=${response.body?.luotDay}`,
  );
});

let laptopCategoryId;
for (let index = 1; index <= 3; index += 1) {
  await check(`6.3.${index}`, `Tạo tin thứ ${index} trả 201 và trừ đúng một lượt`, async () => {
    const token = await getTestToken();
    const categories = await request("/danh-muc");
    expectStatus(categories, 200);
    const laptop = findCategory(categories.body, "Laptop");
    if (!laptop) {
      throw new SmokeFailure("GET /danh-muc", categories.status, "không tìm thấy danh mục con Laptop");
    }
    laptopCategoryId = laptop.id;

    const before = await request("/nguoi-dung/me", { token });
    expectStatus(before, 200);
    const title = `Smoke API ${timestamp}-${index}`;
    const response = await taoTin(token, laptopCategoryId, title);
    expectStatus(response, 201);
    const after = await request("/nguoi-dung/me", { token });
    expectStatus(after, 200);
    expectCondition(
      after.body?.luotDang === before.body?.luotDang - 1,
      after,
      `luotDang phải giảm đúng 1 từ ${before.body?.luotDang}; nhận ${after.body?.luotDang}`,
    );
    return `luotDang ${before.body.luotDang} -> ${after.body.luotDang}`;
  });
}

await check("6.4", "Tin thứ tư trả 400 báo hết lượt và luotDang vẫn bằng 0", async () => {
  const token = await getTestToken();
  const categoryResponse = await request("/danh-muc");
  expectStatus(categoryResponse, 200);
  const laptop = findCategory(categoryResponse.body, "Laptop");
  if (!laptop) {
    throw new SmokeFailure("GET /danh-muc", categoryResponse.status, "không tìm thấy danh mục con Laptop");
  }
  laptopCategoryId = laptop.id;
  const response = await taoTin(token, laptopCategoryId, `Smoke API ${timestamp}-4`);
  expectStatus(response, 400);
  expectCondition(
    /hết lượt/i.test(response.message),
    response,
    `message phải có chữ "hết lượt"; nhận "${response.message}"`,
  );
  const profile = await request("/nguoi-dung/me", { token });
  expectStatus(profile, 200);
  expectCondition(
    profile.body?.luotDang === 0,
    profile,
    `luotDang phải vẫn bằng 0; nhận ${profile.body?.luotDang}`,
  );
  return `HTTP ${response.status}; message="${response.message}"; luotDang=${profile.body.luotDang}`;
});

await check("6.5", "Đẩy tin khi luotDay=0 không thành công", async () => {
  const token = await getTestToken();
  const profile = await request("/nguoi-dung/me", { token });
  expectStatus(profile, 200);
  const post = createdPosts[0];
  if (!post) {
    throw new SmokeFailure("POST /bai-dang/{id}/day-tin", "N/A", "không có tin thử nghiệm để đẩy");
  }
  const response = await request(`/bai-dang/${post.id}/day-tin`, {
    method: "POST",
    token,
  });
  expectCondition(
    response.status < 200 || response.status >= 300,
    response,
    "đẩy tin với luotDay=0 phải thất bại",
  );
  return `HTTP ${response.status}; message="${response.message}"`;
});

await check("7.1", "Tìm kiếm không tham số chỉ trả tin DaDuyet", async () => {
  const response = await request("/bai-dang");
  expectStatus(response, 200);
  expectCondition(
    items(response).every((post) => post.trangThai === "DaDuyet"),
    response,
    "có item không ở trạng thái DaDuyet",
  );
});

for (const [code, sort, ascending] of [
  ["7.2a", "giaTang", true],
  ["7.2b", "giaGiam", false],
]) {
  await check(code, `sapXep=${sort} sắp xếp giá đúng chiều`, async () => {
    const query = new URLSearchParams({ sapXep: sort, pageSize: "50" });
    const response = await request(`/bai-dang?${query}`);
    expectStatus(response, 200);
    const prices = items(response).map((post) => Number(post.giaTien));
    const sorted = prices.every((price, index) =>
      index === 0 || (ascending ? prices[index - 1] <= price : prices[index - 1] >= price),
    );
    expectCondition(sorted, response, `danh sách giá không theo ${sort}: ${prices.join(", ")}`);
  });
}

await check("7.3", "Lọc giá từ 5.000.000 đến 15.000.000", async () => {
  const query = new URLSearchParams({ giaTu: "5000000", giaDen: "15000000", pageSize: "50" });
  const response = await request(`/bai-dang?${query}`);
  expectStatus(response, 200);
  expectCondition(
    items(response).every((post) => Number(post.giaTien) >= 5_000_000 && Number(post.giaTien) <= 15_000_000),
    response,
    "có giaTien ngoài khoảng 5.000.000-15.000.000",
  );
});

await check("7.4", "giaTu lớn hơn giaDen trả 400", async () => {
  const query = new URLSearchParams({ giaTu: "15000000", giaDen: "5000000" });
  const response = await request(`/bai-dang?${query}`);
  expectStatus(response, 400);
});

await check("7.5", "sapXep=abc trả 400", async () => {
  const response = await request("/bai-dang?sapXep=abc");
  expectStatus(response, 400);
});

await check("7.6", "Tìm Honda chỉ trả tin có tiêu đề hoặc nội dung chứa Honda", async () => {
  const query = new URLSearchParams({ keyword: "Honda", pageSize: "50" });
  const response = await request(`/bai-dang?${query}`);
  expectStatus(response, 200);
  expectCondition(
    items(response).every((post) => /honda/i.test(`${post.tieuDe ?? ""} ${post.noiDung ?? ""}`)),
    response,
    "có item không chứa Honda trong tiêu đề hoặc nội dung",
  );
});

await check("7.7", "Lọc danh mục cha Đồ điện tử trả tin thuộc Điện thoại hoặc Laptop", async () => {
  const categories = await request("/danh-muc");
  expectStatus(categories, 200);
  const parent = findCategory(categories.body, "Đồ điện tử");
  const childNames = new Set((parent?.danhMucCons ?? []).map((child) => child.tenDanhMuc));
  if (!parent || childNames.size === 0) {
    throw new SmokeFailure("GET /danh-muc", categories.status, "không tìm thấy danh mục cha/con Đồ điện tử");
  }
  const query = new URLSearchParams({ idDanhMuc: String(parent.id), pageSize: "50" });
  const response = await request(`/bai-dang?${query}`);
  expectStatus(response, 200);
  expectCondition(
    items(response).some((post) => childNames.has(post.tenDanhMuc)),
    response,
    "không có kết quả thuộc danh mục con Điện thoại/Laptop",
  );
});

for (let index = 0; index < 3; index += 1) {
  await check(`7.8.${index + 1}`, `Tin ChoDuyet thứ ${index + 1} không xuất hiện trong tìm kiếm công khai`, async () => {
    const post = createdPosts[index];
    if (!post) {
      throw new SmokeFailure("GET /bai-dang?keyword=...", "N/A", `tin thử nghiệm thứ ${index + 1} chưa được tạo`);
    }
    const query = new URLSearchParams({ keyword: post.tieuDe, pageSize: "50" });
    const response = await request(`/bai-dang?${query}`);
    expectStatus(response, 200);
    expectCondition(
      !items(response).some((item) => item.id === post.id),
      response,
      `tin id=${post.id} trạng thái ChoDuyet xuất hiện trong kết quả`,
    );
  });
}

await check("7.9", "sapXep=uuTien đưa tin đã đẩy gần nhất trước tin chưa đẩy", async () => {
  const query = new URLSearchParams({ sapXep: "uuTien", pageSize: "50" });
  const response = await request(`/bai-dang?${query}`);
  expectStatus(response, 200);
  const list = items(response);
  const topFive = latestFiveSummary(response);
  const pushed = list.filter((post) => post.ngayDayTin && !post.laTinUuTien);
  const unpushed = list.filter((post) => !post.ngayDayTin && !post.laTinUuTien);
  const comparable = pushed
    .map((post) => ({
      post,
      earlierUnpushed: unpushed.find(
        (candidate) => new Date(candidate.ngayDang) < new Date(post.ngayDayTin),
      ),
    }))
    .filter((pair) => pair.earlierUnpushed)
    .sort((a, b) => new Date(b.post.ngayDayTin) - new Date(a.post.ngayDayTin))[0];

  if (!comparable) {
    throw new SmokeFailure(
      `${response.method} ${response.path}`,
      response.status,
      `không có cặp tin đã đẩy/chưa đẩy phù hợp để đối chiếu; 5 tin đầu=${JSON.stringify(topFive)}`,
    );
  }

  const pushedIndex = list.findIndex((post) => post.id === comparable.post.id);
  const unpushedIndex = list.findIndex((post) => post.id === comparable.earlierUnpushed.id);
  expectCondition(
    pushedIndex < unpushedIndex,
    response,
    `tin đã đẩy id=${comparable.post.id} ở vị trí ${pushedIndex + 1}, tin chưa đẩy id=${comparable.earlierUnpushed.id} ở vị trí ${unpushedIndex + 1}; 5 tin đầu=${JSON.stringify(topFive)}`,
  );
  return `5 tin đầu=${JSON.stringify(topFive)}`;
});

await check("8.1", "Không token gọi GET /bai-dang/cua-toi trả 401", async () => {
  const response = await request("/bai-dang/cua-toi");
  expectStatus(response, 401);
});

await check("8.2a", "nguoimua gọi GET /bai-dang/quan-tri trả 403", async () => {
  buyerToken = await getBuyerToken();
  const response = await request("/bai-dang/quan-tri", { token: buyerToken });
  expectStatus(response, 403);
});

await check("8.2b", "nguoimua gọi GET /bai-dang/quan-tri/thong-ke trả 403", async () => {
  const token = await getBuyerToken();
  const response = await request("/bai-dang/quan-tri/thong-ke", { token });
  expectStatus(response, 403);
});

await check("8.2c", "nguoimua gọi GET /bai-dang/cho-duyet trả 403", async () => {
  const token = await getBuyerToken();
  const response = await request("/bai-dang/cho-duyet", { token });
  expectStatus(response, 403);
});

await check("8.3", "nguoimua PUT /bai-dang/{id}/duyet tin ChoDuyet của tài khoản khác trả 403", async () => {
  const token = await getBuyerToken();
  const post = createdPosts[0];
  if (!post) {
    throw new SmokeFailure("PUT /bai-dang/{id}/duyet", "N/A", "không có tin ChoDuyet để kiểm tra");
  }
  const response = await request(`/bai-dang/${post.id}/duyet`, { method: "PUT", token });
  expectStatus(response, 403);
});

await check("8.4", "nguoimua GET chi tiết tin ChoDuyet của tài khoản khác trả 404", async () => {
  const token = await getBuyerToken();
  const post = createdPosts[0];
  if (!post) {
    throw new SmokeFailure("GET /bai-dang/{id}", "N/A", "không có tin ChoDuyet để kiểm tra");
  }
  const response = await request(`/bai-dang/${post.id}`, { token });
  expectStatus(response, 404);
});

await check("8.5a", "nguoimua PUT /bai-dang/{id} tin DaDuyet của nguoiban1 trả 403", async () => {
  const token = await getBuyerToken();
  const context = await getSellerContext();
  const response = await request(`/bai-dang/${context.postId}`, {
    method: "PUT",
    token,
    body: context.updateBody,
  });
  expectStatus(response, 403);
});

await check("8.5b", "nguoimua PUT /bai-dang/{id}/an tin DaDuyet của nguoiban1 trả 403", async () => {
  const token = await getBuyerToken();
  const context = await getSellerContext();
  const response = await request(`/bai-dang/${context.postId}/an`, { method: "PUT", token });
  expectStatus(response, 403);
});

await check("8.5c", "nguoimua PUT /bai-dang/{id}/da-ban tin DaDuyet của nguoiban1 trả 403", async () => {
  const token = await getBuyerToken();
  const context = await getSellerContext();
  const response = await request(`/bai-dang/${context.postId}/da-ban`, { method: "PUT", token });
  expectStatus(response, 403);
});

await check("8.5d", "nguoimua DELETE /bai-dang/{id} tin DaDuyet của nguoiban1 trả 403", async () => {
  const token = await getBuyerToken();
  const context = await getSellerContext();
  const response = await request(`/bai-dang/${context.postId}`, { method: "DELETE", token });
  expectStatus(response, 403);
});

await check("8.5e", "Tin của nguoiban1 vẫn DaDuyet sau các yêu cầu trái quyền", async () => {
  const context = await getSellerContext();
  const token = sellerToken;
  const response = await request("/bai-dang/cua-toi?trangThai=DaDuyet&pageSize=50", { token });
  expectStatus(response, 200);
  const post = items(response).find((item) => item.id === context.postId);
  expectCondition(
    post?.trangThai === "DaDuyet",
    response,
    `tin id=${context.postId} không còn DaDuyet; trạng thái=${post?.trangThai ?? "không tìm thấy"}`,
  );
});

await check("8.6a", "admin GET /bai-dang/quan-tri trả 200", async () => {
  adminToken = await login("admin@chodocu.local", "Admin@123");
  const response = await request("/bai-dang/quan-tri", { token: adminToken });
  expectStatus(response, 200);
});

await check("8.6b", "admin GET /bai-dang/quan-tri/thong-ke trả 200", async () => {
  if (!adminToken) adminToken = await login("admin@chodocu.local", "Admin@123");
  const response = await request("/bai-dang/quan-tri/thong-ke", { token: adminToken });
  expectStatus(response, 200);
});

await check("CLEANUP", "Xóa các tin đã tạo trong mục 6", async () => {
  if (createdPosts.length === 0) return "không có tin nào cần xóa";
  const token = await getTestToken();
  const failures = [];
  for (const post of createdPosts) {
    const response = await request(`/bai-dang/${post.id}`, { method: "DELETE", token });
    if (response.status !== 204) {
      failures.push(
        `${response.method} ${response.path}: status=${response.status}, message=${response.message}`,
      );
    }
  }
  if (failures.length > 0) {
    throw new SmokeFailure(
      "DELETE /bai-dang/{id}",
      "nhiều",
      failures.join(" | "),
    );
  }
  return `đã xóa ${createdPosts.length} tin`;
});

const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;
console.log(`Tổng kết: PASS=${passed} FAIL=${failed}`);
