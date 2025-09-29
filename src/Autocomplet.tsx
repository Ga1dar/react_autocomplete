import { useEffect, useMemo, useRef, useState } from 'react';
import { Person } from './types/Person';
import * as React from 'react';


type Props = {
  people: Person[];
  delay?: number;
  onSelected: (p: Person | null) => void;
};

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export const Autocomplete: React.FC<Props> = ({ people, delay, onSelected }) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Person | null>(null);

  const debounced = useDebounced(input, delay);

  const lastSearchRef = useRef<string>('');
  const lastResultsRef = useRef<Person[]>(people);

  const shouldShowAll = open && input.trim() === '';

  const suggestions = useMemo(() => {
  
    if (debounced === lastSearchRef.current) {
      return lastResultsRef.current;
    }

    lastSearchRef.current = debounced;

    const query = debounced.trim().toLowerCase();
    const results = query
      ? people.filter(p => p.name.toLowerCase().includes(query))
      : people;

    lastResultsRef.current = results;
    return results;
  }, [people, debounced]);

  const list = shouldShowAll ? people : suggestions;
  const nothingFound = !shouldShowAll && suggestions.length === 0;

  const handleSelected = (p: Person) => {
    setSelected(p);
    setInput(p.name);
    setOpen(false);
    onSelected(p);
  };

  useEffect(() => {
    if (selected && selected.name !== input) {
      setSelected(null);
      onSelected(null);
    }
  }, [input, selected, onSelected]);

  return (
    <div className={`dropdown ${open ? 'is-active' : ''}`}>
      <div className="dropdown-trigger" style={{ width: '100%' }}>
        <input
          type="text"
          placeholder="Enter a part of the name"
          className="input"
          value={input}
          onChange={(e) => {
            const v = e.target.value;
            setInput(v);
            setOpen(true);
             if (selected) onSelected(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), delay)}
          data-cy="search-input"
        />
      </div>

      {open && (
        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {nothingFound && (
              <div className="dropdown-item" data-cy="no-suggestions-message">
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
