interface Options {
  username: string
  password: string
  host: string
  port: number
  database: string
}

export const getConnectionString = (options: Options): string => {
  const password = encodeURIComponent(options.password)
  const username = encodeURIComponent(options.username)
  return `postgresql://${username}:${password}@${options.host}:${options.port}/${options.database}`
}
