export class Weather {
    weather: {
        0: {
            id: number;
            main: string;
            description: string;
            icon: string;
        }
    };
    base: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    name: string;
}
