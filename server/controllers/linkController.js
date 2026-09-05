import Link from '../models/Link.js';


//createLink 

export const createLink = async (req, res) => {
    const { name, link } = req.body;
    const user = req.user._id;

    try {
        const order = await Link.countDocuments({ user })

        if (req.user.subscription === "Free" && order >= 5) {
            return res.status(403).json({ message: "Your free subscription only gives you upto 5 links." })
        }

        const createdLink = await Link.create({ name, link, user, order })

        res.status(201).json({ link: createdLink, message: "Link created successfully ." })

    } catch (err) {
        res.status(400).json({ message: err.message })
    }

}

//Getting the links

export const getLinks = async (req, res) => {
    try {


        const linkList = await Link.find({ user: req.user._id }).sort({ order: 1 })  // We are using .sort here which is a mongoose method to sort things up it takes the field you want to sort it as and value 1 and -1 for ascending and descending.

        if (linkList.length === 0) {
            return res.status(200).json({ message: "No Links found" })
        }

        res.status(200).json(linkList)

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


//Update Link 


export const updateLink = async (req, res) => {

    try {
        const { name, link } = req.body
        const user = req.user._id
        const id = req.params.id

        const fetchedLink = await Link.findOne({ _id: id, user })

        if (!fetchedLink) {
            return res.status(404).json({ message: "No Link found." })
        }

        fetchedLink.name = name
        if (fetchedLink.link !== link) {
            fetchedLink.clickCount = 0
        }
        fetchedLink.link = link

        await fetchedLink.save()

        res.status(200).json({ message: "Link updated", fetchedLink })

    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// Delete Link

export const deleteLink = async (req, res) => {
    try {
        const user = req.user._id;
        const id = req.params.id;

        const filter = { _id: id, user }
        const deletedLink = await Link.findOneAndDelete(filter)

        if (deletedLink) {
            res.status(200).json({ message: "Link Deleted successfully" })
        } else {
            res.status(404).json({ message: "No Link found." })
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}