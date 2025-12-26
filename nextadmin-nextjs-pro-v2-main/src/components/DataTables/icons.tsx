type SVGPropsType = React.ComponentProps<"svg">;

export function PointerUp(props: SVGPropsType) {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="currentColor"
      {...props}
    >
      <path d="M5 0L0 5H10L5 0Z" fill="" />
    </svg>
  );
}
