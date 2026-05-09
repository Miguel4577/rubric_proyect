const CardFour = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        <svg
          className="fill-primary dark:fill-white"
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.37498 11.5219C6.28748 11.5219 7.06248 10.6812 7.06248 9.69372C7.06248 8.70622 6.28748 7.86562 5.37498 7.86562C4.46248 7.86562 3.68748 8.70622 3.68748 9.69372C3.68748 10.6812 4.46248 11.5219 5.37498 11.5219Z"
            fill=""
          />
          <path
            d="M11.9375 11.5219C12.85 11.5219 13.625 10.6812 13.625 9.69372C13.625 8.70622 12.85 7.86562 11.9375 7.86562C11.025 7.86562 10.25 8.70622 10.25 9.69372C10.25 10.6812 11.025 11.5219 11.9375 11.5219Z"
            fill=""
          />
          <path
            d="M16.4687 7.25628C15.9062 6.86563 15.2937 6.55313 14.6437 6.37813C14.5844 6.35313 14.525 6.34063 14.4656 6.31563C13.6625 6.09 12.7312 5.99375 11.8094 6.06563C11.4 6.1 11.0406 6.24688 10.7312 6.55313C10.7437 6.56563 10.7437 6.56563 10.7562 6.57813C10.7562 6.57813 6.66875 10.4438 6.66875 15.4281V17.0281C6.66875 17.9656 7.2125 18.8219 8.06875 19.2656C9 19.7313 10.0687 19.8281 11.1281 19.725C13.9969 19.3969 16.0844 17.2094 16.4156 14.3406C16.5531 13.1656 16.322 12.0094 15.7656 11.0094C15.9906 10.6156 16.1906 10.3406 16.4687 9.89062C16.5625 9.76563 16.6562 9.66563 16.7374 9.53438C16.8156 9.40313 16.875 9.25313 16.9656 9.12188C16.9988 9.05938 17.0375 9.02188 17.0469 8.94688C17.075 8.84063 17.0469 8.70625 17.0469 8.57813C17.0469 8.24375 16.9062 7.94688 16.4687 7.25628Z"
            fill=""
          />
        </svg>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            14,2k
          </h4>
          <span className="text-sm font-medium">Total Order</span>
        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
          3.45%
          <svg
            className="fill-meta-3"
            width="10"
            height="11"
            viewBox="0 0 10 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
              fill=""
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default CardFour;
