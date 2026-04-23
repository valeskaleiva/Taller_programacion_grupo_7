import React, { useState } from 'react';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [editIndex, setEditIndex] = useState(-1);

    const addProduct = () => {
        if (editIndex >= 0) {
            const updatedProducts = products.map((product, index) => 
                index === editIndex ? productName : product
            );
            setProducts(updatedProducts);
            setEditIndex(-1);
        } else {
            setProducts([...products, productName]);
        }
        setProductName('');
    };

    const editProduct = (index) => {
        setProductName(products[index]);
        setEditIndex(index);
    };

    const deleteProduct = (index) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h1>Inventory Management</h1>
            <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Add/Edit Product"
            />
            <button onClick={addProduct}>{editIndex >= 0 ? 'Update' : 'Add'}</button>
            <ul>
                {products.map((product, index) => (
                    <li key={index}>
                        {product} 
                        <button onClick={() => editProduct(index)}>Edit</button>
                        <button onClick={() => deleteProduct(index)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;