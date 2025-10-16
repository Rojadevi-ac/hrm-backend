import { getDistance } from "geolib";

export const isWithinRadius = (office, employee) => {
    const distance = getDistance(
        { latitude: office.latitude, longitude: office.longitude },
        { latitude: employee.latitude, longitude: employee.longitude }
    );
    return distance <= office.radius;
};
