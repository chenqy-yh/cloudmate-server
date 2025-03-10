type LocationResponse<T> = {
    message: string;
    request_id: string;
    result: T;
    status: number;
}

type ReverseGeocoding = {
    address: string,
    location: {
        lat: number,
        lng: number
    },
}

type Geocoding = {
    location: {
        lat: number,
        lng: number
    },
    title: string
}