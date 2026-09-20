import maxmind from 'maxmind';

let lookup; 

export const loadGeoDB = async () => {
    lookup = await maxmind.open('./data/GeoLite2-Country.mmd');
}

export const getCountry = (ip) => {
    const result = lookup?.get(ip);
    return result?.country?.iso_code;
}


// Now we will move on to work with the tracker.js