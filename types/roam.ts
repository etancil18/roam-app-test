export interface Stop {
  name: string
  address?: string
}

export interface RouteData {
  stops: Stop[]
}

export interface UserRoute {
  id: string
  name: string
  user_id: string
  route_data: RouteData
}
