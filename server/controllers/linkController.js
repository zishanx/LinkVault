import Link from '../models/Link.js';


//createLink 

export const createLink = async (req, res) => {
    const { name, link } = req.body;
    const user = req.user._id;

    try {
        const order = await Link.countDocuments({ user })

        const createdLink = await Link.create({ name, link, user, order })

        res.status(200).json({link:createdLink, message: "Link created successfully ."})

    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}