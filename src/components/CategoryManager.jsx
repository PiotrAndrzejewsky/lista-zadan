import { useState } from 'react';

const CategoryManager = ({ onAdd }) => {
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');

    const withPort = (path) => {
        const url = new URL(window.location.origin);
        url.port = 5000;
        url.pathname = path;
        return url.toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newCategory.trim()) {
            setError('Nazwa kategorii nie może być pusta');
            return;
        }

        try {
            const response = await fetch(withPort('/api/categories'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category: newCategory.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to add category');
            }

            onAdd(newCategory.trim());
            setNewCategory('');
        } catch (err) {
            setError('Wystąpił błąd podczas dodawania kategorii');
            console.error('Error adding category:', err);
        }
    };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <input
        type="text"
        placeholder="Nowa kategoria..."
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
      />
      <button type="submit">Dodaj kategorię</button>
    </form>
  );
};

export default CategoryManager;