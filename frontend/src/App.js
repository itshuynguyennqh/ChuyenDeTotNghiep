import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // Tạo một state để lưu trữ danh sách sản phẩm, khởi tạo là một mảng rỗng
  const [products, setProducts] = useState([]);

  // useEffect sẽ chạy một lần sau khi component được render lần đầu tiên
  useEffect(() => {
    // Định nghĩa một hàm async để lấy dữ liệu
    const fetchProducts = async () => {
      try {
        // Gửi yêu cầu GET đến API của Django
        const response = await axios.get('http://localhost:8000/api/products/');
        // Cập nhật state với dữ liệu nhận được
        setProducts(response.data);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
      }
    };

    // Gọi hàm để lấy dữ liệu
    fetchProducts();
  }, []); // Mảng rỗng `[]` đảm bảo useEffect chỉ chạy một lần

  return (
    <div className="App">
      <header className="App-header">
        <h1>Danh sách sản phẩm</h1>
        <div>
          {/* Kiểm tra xem có sản phẩm nào không */}
          {products.length > 0 ? (
            <ul>
              {/* Lặp qua mảng products và hiển thị tên của từng sản phẩm */}
              {products.map(product => (
                <li key={product.id}>{product.name} - ${product.list_price}</li>
              ))}
            </ul>
          ) : (
            // Hiển thị thông báo nếu không có sản phẩm
            <p>Không có sản phẩm nào để hiển thị.</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
