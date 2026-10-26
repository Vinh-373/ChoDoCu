import Breadcrumbs from "./Breadcrumbs";
import HeaderNav from "./HeaderNav";
import Logo from "./Logo";
import PostAdButton from "./PostAdButton";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

/** Header dính đầu trang: logo · tìm kiếm · lối tắt · đăng tin · tài khoản, kèm thanh breadcrumb. */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-margin-desktop min-h-20 py-space-sm flex flex-wrap items-center justify-between gap-x-gutter-desktop gap-y-space-sm">
        <Logo />
        {/* Dưới md ô tìm kiếm xuống hàng riêng, đủ rộng để gõ. */}
        <div className="order-last w-full md:order-none md:w-auto md:flex-1 md:max-w-2xl md:px-space-md">
          <SearchBar />
        </div>
        <div className="flex items-center gap-space-md shrink-0">
          <HeaderNav />
          <PostAdButton />
          <UserMenu />
        </div>
      </div>
      <Breadcrumbs />
    </header>
  );
}
