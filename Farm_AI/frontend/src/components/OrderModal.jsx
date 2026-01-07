import React from 'react';

const OrderModal = ({ open, onClose, product, onConfirm }) => {
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (product) setQuantity(1);
  }, [product]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">Order {product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Price: ₹{product.price} / {product.unit}</p>

        <label className="block text-sm font-medium">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1')))}
          className="w-full px-3 py-2 rounded-lg border mt-2 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded-lg bg-farm-green text-white"
            onClick={() => onConfirm(quantity)}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
