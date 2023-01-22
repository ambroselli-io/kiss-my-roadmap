const QuestionMarkButton = ({ className = "", ...props }) => {
  return (
    <button
      type="button"
      className={[
        "border-main text-main hover:bg-main ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-white text-xs font-bold shadow-none transition-colors hover:text-white",
        className,
      ].join(" ")}
      {...props}
    >
      ?
    </button>
  );
};

export default QuestionMarkButton;
