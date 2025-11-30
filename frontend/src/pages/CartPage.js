import React, { useEffect, useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './CartPage.css';

function CartPage(){
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true );

    useEffect(()=>{
        const fetchCart = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/cart/');
            } catch (error){
                console.error("Lỗi khi lấy dữ liệu rỏ hàng", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    if (loading){
        return <div className="container text-center my-5">Đang tải rỏ hàng</div>
    } if (!cart || !cart.cartitemid || cart.cartitem_set.length === 0){
        return <div className="container text-center my-5">Giỏ hàng của bạn đang trống.</div>;
    }

    // Tính tổng tiền
    const cartTotal = cart.cartitem_set.reduce((total, item) => total + parseFloat(item.subtotal), 0);

    return (
        <div className="container my-5">
            <h2 className="mb-4">Giỏ hàng của bạn</h2>
            <div className="row">
                <div className="col-lg-8">
                    <table className="table cart-table">
                        <thead>
                        <tr>
                            <th scope="col">Sản phẩm</th>
                            <th scope="col">Giá</th>
                            <th scope="col">Số lượng</th>
                            <th scope="col">Tạm tính</th>
                            <th scope="col"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {cart.cartitem_set.map(item => (
                            <tr key={item.cartitemid}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={`https://demo.componentone.com/ASPNET/AdventureWorks/ProductImage.ashx?ProductID=${item.productid.productid}&size=large`}
                                            alt={item.productid.name}
                                            className="cart-item-image"
                                        />
                                        <Link to={`/products/${item.productid.productid}`} className="ms-3 text-dark fw-bold text-decoration-none">
                                            {item.productid.name}
                                        </Link>
                                    </div>
                                </td>
                                <td>${parseFloat(item.unitprice).toFixed(2)}</td>
                                <td>
                                    <input type="number" defaultValue={item.quantity} className="form-control quantity-input" />
                                </td>
                                <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-danger">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Tổng cộng</h5>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Tạm tính</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Phí vận chuyển</span>
                                    <span>Free</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between fw-bold">
                                    <span>Tổng tiền</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </li>
                            </ul>
                            <button className="btn btn-primary w-100 mt-3">Tiến hành thanh toán</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;








