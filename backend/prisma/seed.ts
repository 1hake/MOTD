import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Hash function using bcrypt (consistent with auth routes)
async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function main() {
    // Clear existing data
    await prisma.friendship.deleteMany({});
    await prisma.songPost.deleteMany({});
    await prisma.deviceToken.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Cleared existing data');

    // Create example users
    const alice = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            passwordHash: await hashPassword('alice123')
        }
    });

    const bob = await prisma.user.create({
        data: {
            email: 'bob@example.com',
            passwordHash: await hashPassword('bob123')
        }
    });

    const charlie = await prisma.user.create({
        data: {
            email: 'charlie@example.com',
            passwordHash: await hashPassword('charlie123')
        }
    });

    const david = await prisma.user.create({
        data: {
            email: 'david@example.com',
            passwordHash: await hashPassword('david123')
        }
    });

    const emma = await prisma.user.create({
        data: {
            email: 'emma@example.com',
            passwordHash: await hashPassword('emma123')
        }
    });

    console.log('Created example users');

    // Create friendships
    // Alice is friends with Bob, Charlie and David
    await prisma.friendship.createMany({
        data: [
            { userId: alice.id, friendId: bob.id },
            { userId: alice.id, friendId: charlie.id },
            { userId: alice.id, friendId: david.id },
            // Bob is friends with Alice and Emma
            { userId: bob.id, friendId: alice.id },
            { userId: bob.id, friendId: emma.id },
            // Charlie is friends with Alice
            { userId: charlie.id, friendId: alice.id },
            // David is friends with Alice and Emma
            { userId: david.id, friendId: alice.id },
            { userId: david.id, friendId: emma.id },
            // Emma is friends with Bob and David
            { userId: emma.id, friendId: bob.id },
            { userId: emma.id, friendId: david.id },
        ]
    });

    console.log('Created friendships');

    // Yesterday's songs
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Day before yesterday's songs
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    // Create song posts
    await prisma.songPost.createMany({
        data: [
            // Yesterday's songs
            {
                title: "Dancing Queen",
                artist: "ABBA",
                link: "https://www.deezer.com/track/681819",
                deezerLink: "https://www.deezer.com/track/681819",
                spotifyLink: "https://open.spotify.com/search/ABBA%20Dancing%20Queen",
                appleMusicLink: "https://music.apple.com/search?term=ABBA%20Dancing%20Queen",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/2e248b0408a8163aefecf78e1863377c/500x500-000000-80-0-0.jpg",
                userId: alice.id,
                date: yesterday
            },
            {
                title: "Bohemian Rhapsody",
                artist: "Queen",
                link: "https://www.deezer.com/track/7868661",
                deezerLink: "https://www.deezer.com/track/7868661",
                spotifyLink: "https://open.spotify.com/search/Queen%20Bohemian%20Rhapsody",
                appleMusicLink: "https://music.apple.com/search?term=Queen%20Bohemian%20Rhapsody",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/8b8fc5d117f9357511d724f37330469d/500x500-000000-80-0-0.jpg",
                userId: bob.id,
                date: yesterday
            },
            {
                title: "Billie Jean",
                artist: "Michael Jackson",
                link: "https://www.deezer.com/track/3102703",
                deezerLink: "https://www.deezer.com/track/3102703",
                spotifyLink: "https://open.spotify.com/search/Michael%20Jackson%20Billie%20Jean",
                appleMusicLink: "https://music.apple.com/search?term=Michael%20Jackson%20Billie%20Jean",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/9108d814176fee16fbe09c71714c44ff/500x500-000000-80-0-0.jpg",
                userId: charlie.id,
                date: yesterday
            },

            // Day before yesterday's songs
            {
                title: "Imagine",
                artist: "John Lennon",
                link: "https://www.deezer.com/track/2295905",
                deezerLink: "https://www.deezer.com/track/2295905",
                spotifyLink: "https://open.spotify.com/search/John%20Lennon%20Imagine",
                appleMusicLink: "https://music.apple.com/search?term=John%20Lennon%20Imagine",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/ec3c839d3c6578147a58f6800638964c/500x500-000000-80-0-0.jpg",
                userId: david.id,
                date: dayBeforeYesterday
            },
            {
                title: "Like a Prayer",
                artist: "Madonna",
                link: "https://www.deezer.com/track/624811",
                deezerLink: "https://www.deezer.com/track/624811",
                spotifyLink: "https://open.spotify.com/search/Madonna%20Like%20a%20Prayer",
                appleMusicLink: "https://music.apple.com/search?term=Madonna%20Like%20a%20Prayer",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/7d014bf09baf2929cf9ffeb0d453eeea/500x500-000000-80-0-0.jpg",
                userId: emma.id,
                date: dayBeforeYesterday
            },
            {
                title: "Smells Like Teen Spirit",
                artist: "Nirvana",
                link: "https://www.deezer.com/track/13560141",
                deezerLink: "https://www.deezer.com/track/13560141",
                spotifyLink: "https://open.spotify.com/search/Nirvana%20Smells%20Like%20Teen%20Spirit",
                appleMusicLink: "https://music.apple.com/search?term=Nirvana%20Smells%20Like%20Teen%20Spirit",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/0a1b1e3d711d610fa1b7704998a59304/500x500-000000-80-0-0.jpg",
                userId: alice.id,
                date: dayBeforeYesterday
            },
            {
                title: "Hotel California",
                artist: "Eagles",
                link: "https://www.deezer.com/track/2168151",
                deezerLink: "https://www.deezer.com/track/2168151",
                spotifyLink: "https://open.spotify.com/search/Eagles%20Hotel%20California",
                appleMusicLink: "https://music.apple.com/search?term=Eagles%20Hotel%20California",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/0a8d8982a30c4001d9c9ad59c6ad5c5f/500x500-000000-80-0-0.jpg",
                userId: bob.id,
                date: dayBeforeYesterday
            },
            {
                title: "Sweet Child O' Mine",
                artist: "Guns N' Roses",
                link: "https://www.deezer.com/track/2133230",
                deezerLink: "https://www.deezer.com/track/2133230",
                spotifyLink: "https://open.spotify.com/search/Guns%20N%27%20Roses%20Sweet%20Child%20O%27%20Mine",
                appleMusicLink: "https://music.apple.com/search?term=Guns%20N%27%20Roses%20Sweet%20Child%20O%27%20Mine",
                coverUrl: "https://e-cdns-images.dzcdn.net/images/cover/8b58ef25317992b99c9894798a2729b0/500x500-000000-80-0-0.jpg",
                userId: charlie.id,
                date: dayBeforeYesterday
            }
        ]
    });

    console.log('Created song posts');
    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
