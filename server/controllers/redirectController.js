import Click from "../models/Click";
import Link from '../models/Link'
import { getCountry } from "../utils/geoip";

export const redirect = async (req, res) => {

    const id = req.params.id

    try {
        const link = await Link.findById(id)
        if (link) {
            res.redirect(link.link)
            const country = getCountry(req.ip)
            link.clickCount++
            link.save().catch(err => console.log(err))
            Click.create({ link: id, country }).catch(err => console.log(err))
        } else {
            res.status(404).json({ message: "Invalid Link!" })
        }
    } catch (error) {
        console.log(error)
    }




}