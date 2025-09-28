const UsersIcon = ({ size = 20, className = '', title = 'Users icon' }) => (
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
      d="M8 11C10.2091 11 12 9.20914 12 7C12 4.79086 10.2091 3 8 3C5.79086 3 4 4.79086 4 7C4 9.20914 5.79086 11 8 11Z"
      fill="currentColor"
    />
    <path
      d="M16 12C18.2091 12 20 10.2091 20 8C20 5.79086 18.2091 4 16 4C13.7909 4 12 5.79086 12 8C12 10.2091 13.7909 12 16 12Z"
      fill="currentColor"
      opacity="0.7"
    />
    <path
      d="M4 14C4 12.8954 4.89543 12 6 12H10C11.1046 12 12 12.8954 12 14V18C12 19.1046 11.1046 20 10 20H6C4.89543 20 4 19.1046 4 18V14Z"
      fill="currentColor"
    />
    <path
      d="M13 15C13 13.8954 13.8954 13 15 13H19C20.1046 13 21 13.8954 21 15V18C21 19.1046 20.1046 20 19 20H15C13.8954 20 13 19.1046 13 18V15Z"
      fill="currentColor"
      opacity="0.7"
    />
  </svg>
)

export default UsersIcon
