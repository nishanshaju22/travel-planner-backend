import { prisma } from '../config/db.js'


async function addToBucketList(userId, place) {
 
    if (!userId) {
        throw new Error("no user was provided");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId}
    });

    if (!user) {
        throw new Error("This user does not exsist");
    }

    if (user.bucketList.includes(place)) {
        throw new Error("This place already exsist in the bucketList");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { bucketList: { push: place } } 
    });

    return {
        message: "Success",
        data: place
    }
}

async function showBucketList(userId) {

    console.log(userId)
    
    if (!userId) {
        throw new Error("no user was provided");
    }
    
    const user = await prisma.user.findUnique({
        where: {id: userId}
    });
    
    if (!user) {
        throw new Error("User does not exsists");
    }
    
    return user.bucketList
}

async function deleteBucketList(userId, place) {
    if (!userId) throw new Error("no user provided")
    if (!place) throw new Error("no place provided")

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { bucketList: true }
    })

    if (!user) throw new Error("user not found")

    const updatedBucketList = user.bucketList.filter(
        item => item !== place
    )

    await prisma.user.update({
        where: { id: userId },
        data: {
            bucketList: updatedBucketList
        }
    })


    return {
        message: "success",
        data: updatedBucketList
    }
}


export { addToBucketList, showBucketList, deleteBucketList }