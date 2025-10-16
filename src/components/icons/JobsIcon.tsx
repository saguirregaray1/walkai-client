import type { JSX, SVGProps } from 'react'

export type JobsIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: number
  title?: string
}

const JobsIcon = ({ size = 20, title = 'Jobs icon', ...svgProps }: JobsIconProps): JSX.Element => {
  const accessibilityProps = title
    ? ({ role: 'img' } as const)
    : ({ role: 'presentation', 'aria-hidden': true } as const)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...accessibilityProps}
      {...svgProps}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M8.5 6.5V5.25C8.5 3.45507 9.95507 2 11.75 2H12.25C14.0449 2 15.5 3.45507 15.5 5.25V6.5H18.5C20.433 6.5 22 8.067 22 10V17.5C22 19.433 20.433 21 18.5 21H5.5C3.567 21 2 19.433 2 17.5V10C2 8.067 3.567 6.5 5.5 6.5H8.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M9.5 6.5V5.25C9.5 4.00736 10.5074 3 11.75 3H12.25C13.4926 3 14.5 4.00736 14.5 5.25V6.5H9.5Z"
        fill="currentColor"
      />
      <path
        d="M3 10.75H21V13.5C21 15.433 19.433 17 17.5 17H6.5C4.567 17 3 15.433 3 13.5V10.75Z"
        fill="currentColor"
      />
      <path
        d="M10.75 12.5C10.1977 12.5 9.75 12.9477 9.75 13.5C9.75 14.0523 10.1977 14.5 10.75 14.5H13.25C13.8023 14.5 14.25 14.0523 14.25 13.5C14.25 12.9477 13.8023 12.5 13.25 12.5H10.75Z"
        fill="#ffffff"
        opacity="0.75"
      />
    </svg>
  )
}

export default JobsIcon
