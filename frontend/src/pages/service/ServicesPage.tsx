import { useNavigate } from "react-router-dom";
import { dichVuApi } from "../../api/dichVu";
import ServiceHero from "../../components/service/ServiceHero";
import ServiceHistory from "../../components/service/ServiceHistory";
import ServicePlanGrid from "../../components/service/ServicePlanGrid";
import { Empty, ErrorBox, Spinner } from "../../components/common/State";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFetch } from "../../hooks/useFetch";

export default function ServicesPage() {
  useDocumentTitle("Gói dịch vụ");
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => dichVuApi.danhSach(), []);
  const history = useFetch(
    () => user ? dichVuApi.lichSuMua() : Promise.resolve([]),
    [user?.idNguoiDung],
  );
  const choosePlan = (id: number) => {
    if (!user) {
      toast("Đăng nhập để mua dịch vụ.", "info");
      return navigate("/dang-nhap", { state: { from: "/dich-vu" } });
    }
    navigate(`/dich-vu/thanh-toan/${id}`);
  };

  return (
    <div className="service-page">
      <nav className="service-breadcrumb" aria-label="Đường dẫn">
        <span>Trang chủ</span><span aria-hidden="true">›</span><span>Dịch vụ người bán</span>
        <span aria-hidden="true">›</span><strong>Gói dịch vụ</strong>
      </nav>
      <main className="service-page-content">
        <ServiceHero />

        {loading ? (
          <div className="service-state"><Spinner /></div>
        ) : error ? (
          <div className="service-state"><ErrorBox message={error} onRetry={reload} /></div>
        ) : !data || data.length === 0 ? (
          <div className="service-state"><Empty title="Chưa có gói dịch vụ nào" /></div>
        ) : (
          <ServicePlanGrid services={data} busyId={null} onBuy={choosePlan} />
        )}

        {user && (
          history.loading ? (
            <section className="service-history"><h2>Lịch sử giao dịch</h2><Spinner /></section>
          ) : history.error ? (
            <section className="service-history"><ErrorBox message={history.error} onRetry={history.reload} /></section>
          ) : (
            <ServiceHistory items={history.data ?? []} />
          )
        )}
      </main>
    </div>
  );
}
