import type { JSX, SVGProps } from 'react'

export type DashboardIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: number
  title?: string
}

const DashboardIcon = ({ size = 20, title = 'Dashboard icon', ...svgProps }: DashboardIconProps): JSX.Element => {
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
        d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM14 14H20V20H14V14ZM4 14H10V20H4V14Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default DashboardIcon
