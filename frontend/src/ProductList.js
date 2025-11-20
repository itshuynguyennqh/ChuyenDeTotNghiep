import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link để tạo liên kết

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products/');
        setProducts(response.data);
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy dữ liệu sản phẩm!", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      {products.length > 0 ? (
        <ul>
          {products.map(product => (
            <li key={product.id}>
              {/* Bọc tên sản phẩm trong một Link */}
              <Link to={`/products/${product.id}`}>
                {product.name} - ${product.list_price}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có sản phẩm nào để hiển thị.</p>
      )}
    </div>
  );
}

export default ProductList;
