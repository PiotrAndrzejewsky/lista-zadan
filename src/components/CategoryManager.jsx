import { useState } from 'react';

const CategoryManager = ({ onAdd }) => {
  const [newCat, setNewCat] = useState('');
  const handleAdd = e => {
    e.preventDefault();
    onAdd(newCat.trim());
    setNewCat('');
  };

  return (
    <form onSubmit={handleAdd} className="category-form">
      <input
        type="text"
        placeholder="Nowa kategoria..."
        value={newCat}
        onChange={e => setNewCat(e.target.value)}
      />
      <button type="submit">Dodaj kategorię</button>
    </form>
  );
};

export default CategoryManager;