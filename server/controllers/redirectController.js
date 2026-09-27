import Click from "../models/Click.js";
import Link from '../models/Link.js'
import { getCountry } from "../utils/geoip.js";

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
        if (error.name === "CastError") {

            console.log(error)
            return res.status(404).json({ message: "Invalid Link !" })
        }
        res.status(500).json({ message: "Something went wrong." })
        console.log(error)
    }


}