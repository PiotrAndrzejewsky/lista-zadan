import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const TaskForm = ({ categories, onAdd }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState(categories[0] || '');
    const [deadline, setDeadline] = useState(new Date());
    const [priority, setPriority] = useState(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd({ text, category, deadline: deadline.toISOString(), priority });
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nowe zadanie..."
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={categories.length === 0}
            >
                {categories.map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
            </select>
            <select value={priority} onChange={(e) => setPriority(+e.target.value)}>
                <option value={3}>Wysoki priorytet</option>
                <option value={2}>Średni priorytet</option>
                <option value={1}>Niski priorytet</option>
            </select>
            <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
            />
            <button type="submit">Dodaj</button>
        </form>
    );
};

export default TaskForm;