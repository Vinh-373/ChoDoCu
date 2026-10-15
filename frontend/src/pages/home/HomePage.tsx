import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { baiDangApi } from "../../api/baiDang";
import { bannerApi } from "../../api/banner";
import { danhMucApi } from "../../api/danhMuc";
import { ErrorBox, Spinner, Empty } from "../../components/common/State";
import PostCard from "../../components/common/PostCard";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";
import { imgSrc, onImgError } from "../../utils/image";
import type { Banner } from "../../types";

const TILTS = ["-4deg", "3deg", "-2deg", "5deg", "-5deg", "2deg", "-3deg", "4deg"];

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => window.clearInterval(t);
  }, [banners.length]);

  const current = banners[index % banners.length];
  return (
    <div className="carousel" aria-roledescription="carousel" aria-label="Banner">
      <img src={imgSrc(current.hinhAnh)} alt={current.viTri ?? "Banner"} onError={onImgError} />
      {banners.length > 1 && (
        <div className="carousel-dots">
          {banners.map((b, i) => (
            <button key={b.id} type="button" className={i === index ? "is-on" : ""} aria-label={`Banner ${i + 1}`} onClick={() => setIndex(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  useDocumentTitle();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const categories = useFetch(() => danhMucApi.cay(), []);
  const banners = useFetch(() => bannerApi.danhSach(), []);
  const latest = useFetch(() => baiDangApi.tim({ page: 1, pageSize: 12 }), []);

  const tree = categories.data ?? [];
  // Lấy tối đa 8 danh mục lá để làm "tem giá" ở hero.
  const leaves = tree.flatMap((r) => (r.danhMucCons.length ? r.danhMucCons : [r])).slice(0, 8);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const kw = q.trim();
    navigate(kw ? `/tim-kiem?q=${encodeURIComponent(kw)}` : "/tim-kiem");
  };

  return (
    <>
      <section className="hero">
        <div>
          <h1>Đồ cũ còn tốt, tìm đúng người cần.</h1>
          <p className="lead">Điện thoại, xe máy, đồ gia dụng, nội thất — mua bán trực tiếp giữa người với người, ngay trong thành phố của bạn.</p>
          <form className="hero-search" onSubmit={submit} role="search">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bạn đang tìm gì?" aria-label="Từ khoá tìm kiếm" />
            <button className="btn">Tìm kiếm</button>
          </form>
        </div>
        <div className="tag-cloud" aria-label="Danh mục nổi bật">
          {leaves.map((c, i) => (
            <Link key={c.id} to={`/tim-kiem?danhMuc=${c.id}`} style={{ ["--tilt" as string]: TILTS[i % TILTS.length] }}>
              <span className="price-tag">{c.tenDanhMuc}</span>
            </Link>
          ))}
        </div>
      </section>

      {banners.data && banners.data.length > 0 && (
        <section className="section" aria-label="Banner">
          <BannerCarousel banners={banners.data} />
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Duyệt theo danh mục</h2>
        </div>
        {categories.loading ? (
          <Spinner />
        ) : categories.error ? (
          <ErrorBox message={categories.error} onRetry={categories.reload} />
        ) : tree.length === 0 ? (
          <Empty title="Chưa có danh mục nào" />
        ) : (
          <div className="cat-grid">
            {tree.map((root) => (
              <div key={root.id} className="cat-card">
                <h3>{root.tenDanhMuc}</h3>
                <div className="chips">
                  {(root.danhMucCons.length ? root.danhMucCons : [root]).map((c) => (
                    <Link key={c.id} to={`/tim-kiem?danhMuc=${c.id}`} className="chip">
                      {c.tenDanhMuc}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Tin mới đăng</h2>
          <Link to="/tim-kiem">Xem tất cả</Link>
        </div>
        {latest.loading ? (
          <Spinner />
        ) : latest.error ? (
          <ErrorBox message={latest.error} onRetry={latest.reload} />
        ) : !latest.data || latest.data.items.length === 0 ? (
          <Empty title="Chưa có tin nào được duyệt">
            Hãy <Link to="/dang-bai">đăng tin đầu tiên</Link>. Tin hiện sau khi quản trị viên duyệt.
          </Empty>
        ) : (
          <div className="grid-posts">
            {latest.data.items.map((p) => (
              <PostCard key={p.id} id={p.id} tieuDe={p.tieuDe} giaTien={p.giaTien} anh={p.anhs[0]} noiTrongTin={p.tenThanhPho} ngay={p.ngayDang} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
