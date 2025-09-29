import { useEffect, useMemo, useState, useRef } from 'react';
import { Person } from './types/Person';
import React = require('react');

type Props = {
  people: Person[];
  delay?: number;
  onSelected: (p: Person) => void;
};

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounce] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounce(value), delay);

    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export const Autocomplete: React.FC<Props> = ({
  people,
  delay,
  onSelected,
}) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);

  const debounced = useDebounced(input, delay);
  const lastSearchRef = useRef<string>('');
  const shouldShowAll = open && debounced.trim() === '';

  const suggestions = useMemo(() => {
    if (debounced === lastSearchRef.current) {
      return null;
    }

    lastSearchRef.current = debounced;

    const query = debounced.trim().toLowerCase();

    if (!query) {
      return people;
    }

    return people.filter(p => p.name.toLowerCase().includes(query));
  }, [people, debounced]);

  const list = shouldShowAll ? people : (suggestions ?? []);
  const nothingFound =
    !shouldShowAll && Array.isArray(suggestions) && suggestions.length === 0;

  const handleSelected = (p: Person) => {
    setSelected(p);
    setInput(p.name);
    setOpen(false);
    onSelected(p);
  };

  useEffect(() => {
    if (selected && selected.name !== input) {
      setSelected(null);
    }
  }, [input, selected]);

  return (
    <div className={`dropdown ${open ? 'is-active' : ''}`}>
      <div className="dropdown-trigger" style={{ width: '100%' }}>
        <input
          type="text"
          placeholder="Enter a part of the name"
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          data-cy="search-input"
        />
      </div>

      {open && (
        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {nothingFound && (
              <div className="dropdown-item">
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}

            {list.map(person => (
              <div
                key={person.slug}
                className="dropdown-item"
                data-cy="suggestion-item"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelected(person)}
              >
                <p className="has-text-link">{person.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
