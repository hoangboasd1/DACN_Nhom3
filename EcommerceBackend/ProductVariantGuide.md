# Hướng dẫn sử dụng hệ thống biến thể sản phẩm

## Tổng quan

Hệ thống biến thể sản phẩm cho phép tạo ra các biến thể khác nhau cho một sản phẩm dựa trên màu sắc và kích cỡ. Mỗi biến thể có thể có:
- Số lượng tồn kho riêng
- Giá điều chỉnh riêng (so với giá gốc của sản phẩm)
- Ảnh riêng
- SKU riêng

## Cấu trúc Database

### Bảng mới được thêm:

1. **Colors** - Quản lý màu sắc
2. **Sizes** - Quản lý kích cỡ
3. **ProductVariants** - Biến thể sản phẩm (kết hợp Product + Color + Size)

### Bảng được cập nhật:

1. **Products** - Thêm navigation property `ProductVariants`
2. **Carts** - Thêm `ProductVariantId` (optional)
3. **OrderDetails** - Thêm `ProductVariantId` (optional)
4. **Wishlists** - Thêm `ProductVariantId` (optional)

## API Endpoints

### Color Management
- `GET /api/Color` - Lấy danh sách tất cả màu sắc
- `GET /api/Color/{id}` - Lấy màu sắc theo ID
- `POST /api/Color` - Tạo màu sắc mới
- `PUT /api/Color/{id}` - Cập nhật màu sắc
- `DELETE /api/Color/{id}` - Xóa màu sắc

### Size Management
- `GET /api/Size` - Lấy danh sách tất cả kích cỡ
- `GET /api/Size/{id}` - Lấy kích cỡ theo ID
- `POST /api/Size` - Tạo kích cỡ mới
- `PUT /api/Size/{id}` - Cập nhật kích cỡ
- `DELETE /api/Size/{id}` - Xóa kích cỡ

### ProductVariant Management
- `GET /api/ProductVariant/product/{productId}` - Lấy tất cả biến thể của sản phẩm
- `GET /api/ProductVariant/{id}` - Lấy biến thể theo ID
- `POST /api/ProductVariant` - Tạo biến thể mới
- `PUT /api/ProductVariant/{id}` - Cập nhật biến thể
- `DELETE /api/ProductVariant/{id}` - Xóa biến thể (soft delete)
- `PUT /api/ProductVariant/{id}/stock` - Cập nhật số lượng tồn kho
- `GET /api/ProductVariant/product/{productId}/total-stock` - Lấy tổng số lượng tồn kho
- `GET /api/ProductVariant/product/{productId}/colors` - Lấy màu sắc có sẵn cho sản phẩm
- `GET /api/ProductVariant/product/{productId}/color/{colorId}/sizes` - Lấy kích cỡ có sẵn cho màu sắc
- `GET /api/ProductVariant/find?productId={id}&colorId={id}&sizeId={id}` - Tìm biến thể theo thông số

## Cách sử dụng

### 1. Tạo màu sắc và kích cỡ

```json
// Tạo màu sắc
POST /api/Color
{
    "name": "Đỏ",
    "hexCode": "#FF0000",
    "description": "Màu đỏ tươi"
}

// Tạo kích cỡ
POST /api/Size
{
    "name": "M",
    "code": "M",
    "description": "Medium"
}
```

### 2. Tạo biến thể sản phẩm

```json
POST /api/ProductVariant
{
    "productId": 1,
    "colorId": 1,
    "sizeId": 1,
    "stockQuantity": 50,
    "priceAdjustment": 0,
    "imageUrl": "https://example.com/image.jpg",
    "sku": "PROD-001-RED-M"
}
```

### 3. Quản lý tồn kho

```json
// Cập nhật số lượng tồn kho
PUT /api/ProductVariant/1/stock
{
    "stock": 30
}

// Lấy tổng số lượng tồn kho của sản phẩm
GET /api/ProductVariant/product/1/total-stock
```

### 4. Lấy thông tin biến thể

```json
// Lấy tất cả biến thể của sản phẩm
GET /api/ProductVariant/product/1

// Lấy màu sắc có sẵn
GET /api/ProductVariant/product/1/colors

// Lấy kích cỡ có sẵn cho màu sắc
GET /api/ProductVariant/product/1/color/1/sizes
```

## Logic nghiệp vụ

### 1. Quản lý tồn kho
- Tổng số lượng tồn kho của sản phẩm = tổng số lượng của tất cả biến thể
- Khi đặt hàng, giảm số lượng của biến thể cụ thể
- Khi hủy đơn hàng, tăng lại số lượng của biến thể

### 2. Giá sản phẩm
- Giá cuối cùng = Giá gốc sản phẩm + PriceAdjustment của biến thể
- Nếu PriceAdjustment = null hoặc 0, sử dụng giá gốc

### 3. Ràng buộc dữ liệu
- Mỗi sản phẩm chỉ có thể có một biến thể với cùng màu sắc và kích cỡ
- Không thể xóa màu sắc/kích cỡ đang được sử dụng trong biến thể
- Biến thể bị xóa mềm (IsActive = false) thay vì xóa cứng

## Migration

Để áp dụng thay đổi database:

```bash
cd EcommerceBackend
dotnet ef database update
```

## Dữ liệu mẫu

Hệ thống đã được cấu hình để tự động tạo dữ liệu mẫu cho:
- 30 màu sắc phổ biến
- 35 kích cỡ khác nhau (áo, quần, giày)

Dữ liệu sẽ được tạo tự động khi chạy ứng dụng lần đầu.

## Lưu ý quan trọng

1. **Tương thích ngược**: Các sản phẩm hiện tại vẫn hoạt động bình thường, chỉ cần thêm biến thể khi cần
2. **Performance**: Sử dụng Include() để load dữ liệu liên quan khi cần thiết
3. **Validation**: Luôn kiểm tra sự tồn tại của Product, Color, Size trước khi tạo biến thể
4. **Soft Delete**: Biến thể bị xóa mềm để đảm bảo tính toàn vẹn dữ liệu
