import Click from "../models/Click";
import Link from '../models/Link'
import { getCountry } from "../utils/geoip";

export const redirect = async (req, res) => {

    const id = req.param.id

    const link = await Link.findById(id)

    if (link) {
        res.redirect(link.link)

        const country = getCountry(req.ip)
        link.clickCount++
        Click.create({ id, country })
    }

}