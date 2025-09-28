const DashboardIcon = ({ size = 20, className = '', title = 'Dashboard icon' }) => (
  <svg
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : 'presentation'}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {title ? <title>{title}</title> : null}
    <path
      d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM14 14H20V20H14V14ZM4 14H10V20H4V14Z"
      fill="currentColor"
    />
  </svg>
)

export default DashboardIcon
