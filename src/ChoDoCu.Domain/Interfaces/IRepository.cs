using ChoDoCu.Domain.Common;

namespace ChoDoCu.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(int id); // Lấy một thực thể theo ID
    Task AddAsync(T entity); // Thêm một thực thể mới
    void Update(T entity); // Cập nhật một thực thể
    void Remove(T entity); // Xóa một thực thể
}
