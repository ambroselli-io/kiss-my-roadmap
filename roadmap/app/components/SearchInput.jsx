// https://flowbite.com/docs/forms/search-input/
const SearchInput = ({
  defaultValue,
  type = "search",
  label = "Recherche",
  placeholder = "Recherche",
  name = "search",
  id = "search",
  className = "",
  labelClassName = "sr-only",
}) => {
  return (
    <div className="flex w-full flex-col items-center">
      <label htmlFor={`${name}-${id}`} className={labelClassName}>
        {label}
      </label>
      <div className={`relative w-full ${className}`}>
        <input
          type={type}
          id={`${name}-${id}`}
          name={name}
          className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pr-6 text-gray-900 outline-app dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          placeholder={placeholder}
          defaultValue={defaultValue}
          enterKeyHint="search"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
};

const SearchIcon = () => (
  <svg
    className="h-5 w-5 text-gray-500 dark:text-gray-400"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export default SearchInput;
