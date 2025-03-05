import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import amenityData from '../data/amenities.json' assert { type: 'json' };
import bookingData from '../data/bookings.json' assert { type: 'json' };
import hostData from '../data/hosts.json' assert { type: 'json' };
import propertyData from '../data/properties.json' assert { type: 'json' };
import reviewData from '../data/reviews.json' assert { type: 'json' };
import userData from '../data/users.json' assert { type: 'json' };
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

const saltRounds = 10; // Het aantal keren dat bcrypt het wachtwoord gaat "verharden"

async function main() {
    const { amenities } = amenityData;
    const { bookings } = bookingData;
    const { hosts } = hostData;
    const { properties } = propertyData;
    const { reviews } = reviewData;
    const { users } = userData;

    // Upsert Amenities
    for (const amenity of amenities) {
        await prisma.amenity.upsert({
            where: { id: amenity.id },
            update: {},
            create: amenity,
        });
    }

    // Upsert Hosts
    for (const host of hosts) {
        await prisma.host.upsert({
            where: { id: host.id },
            update: {},
            create: host,
        });
    }

    // Upsert Users
    for (const user of users) {
        const userId = user.id || uuidv4(); // Genereer UUID als er geen id is
        const hashedPassword = await bcrypt.hash(user.password, saltRounds); // Hash het wachtwoord

        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId, 
                name: user.name,
                email: user.email,
                password: hashedPassword, // Sla het gehashte wachtwoord op
                username: user.username,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture,
                pictureUrl: user.pictureUrl || "https://example.com/default-profile-pic.jpg",
            },
        });
    }

    // Upsert Properties
    for (const property of properties) {
        const propertyId = property.id || uuidv4();
        await prisma.property.upsert({
            where: { id: propertyId },
            update: {},
            create: {
                id: propertyId,
                name: property.name,
                location: property.location,
                price: property.price,
                hostId: property.hostId,
                title: property.title,
                description: property.description,
                pricePerNight: property.pricePerNight,
                bedroomCount: property.bedroomCount,
                bathRoomCount: property.bathRoomCount,
                maxGuestCount: property.maxGuestCount,
                rating: property.rating,
            },
        });
    }

    // Upsert Bookings
    for (const booking of bookings) {
        if (!users.some(user => user.id === booking.userId)) {
            console.error(`User with id ${booking.userId} not found!`);
            continue;
        }

        if (!hosts.some(host => host.id === booking.hostId)) {
            console.error(`Host with id ${booking.hostId} not found!`);
            continue;
        }

        const bookingId = booking.id || uuidv4();

        await prisma.booking.upsert({
            where: { id: bookingId },
            update: {},
            create: {
                id: bookingId,
                title: booking.title,
                userId: booking.userId,
                propertyId: booking.propertyId,
                checkinDate: new Date(booking.checkinDate),
                checkoutDate: new Date(booking.checkoutDate),
                numberOfGuests: booking.numberOfGuests,
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                hostId: booking.hostId,
            },
        });
    }

    // Upsert Reviews
    for (const review of reviews) {
        const reviewId = review.id || uuidv4();
        await prisma.review.upsert({
            where: { id: reviewId },
            update: {},
            create: {
                id: reviewId,
                userId: review.userId,
                propertyId: review.propertyId,
                rating: review.rating,
                comment: review.comment,
            },
        });
    }
}

main()
    .then(() => {
        console.log('Data seeded successfully!');
        prisma.$disconnect();
    })
    .catch((error) => {
        console.error('Error seeding data:', error);
        prisma.$disconnect();
        process.exit(1);
    });
