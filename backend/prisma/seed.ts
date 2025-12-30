import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Hash function using bcrypt (consistent with auth routes)
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

async function main() {
  // Clear existing data
  await prisma.save.deleteMany({})
  await prisma.friendship.deleteMany({})
  await prisma.songPost.deleteMany({})
  await prisma.deviceToken.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Cleared existing data')

  // Create users
  const usersData = [
    {
      id: 1,
      email: 'alice@example.com',
      name: null,
      profileImage: null,
      platformPreference: null,
      passwordHash: '$2b$10$twVaf22c717pkyAsMQrowekrWLvAit.fOmveB3aYtjeVl2bhnUnca',
      createdAt: '2025-12-29T11:12:41.806Z'
    },
    {
      id: 3,
      email: 'charlie@example.com',
      name: null,
      profileImage: null,
      platformPreference: null,
      passwordHash: '$2b$10$Yh6FvRVt2sn6D71vVPD0du5l2a4iAiufRK6lDwwL2NTkyju0xoNZ2',
      createdAt: '2025-12-29T11:12:41.916Z'
    },
    {
      id: 4,
      email: 'david@example.com',
      name: null,
      profileImage: null,
      platformPreference: null,
      passwordHash: '$2b$10$dbWa0btNumX4LjyavGeRBeqcBis9LXojHz6v54x9E4YbuER9hDdiS',
      createdAt: '2025-12-29T11:12:41.971Z'
    },
    {
      id: 5,
      email: 'emma@example.com',
      name: null,
      profileImage: null,
      platformPreference: null,
      passwordHash: '$2b$10$Om20mFdq8cvOiwBBms.nROvG2h6XMG6YsuhBaXnU/qre0uiywCwb.',
      createdAt: '2025-12-29T11:12:42.025Z'
    },
    {
      id: 2,
      email: 'bob@example.com',
      name: null,
      profileImage: null,
      platformPreference: 'youtube',
      passwordHash: '$2b$10$kCGLfUNHYyNq6VTYswopgup12x640tRUTcx.H6rqorP3IEZzGc.LC',
      createdAt: '2025-12-29T11:12:41.862Z'
    }
  ]
  for (const user of usersData) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        platformPreference: user.platformPreference,
        passwordHash: user.passwordHash,
        createdAt: new Date(user.createdAt)
      }
    })
  }
  console.log('Created ' + usersData.length + ' users')

  // Create song posts
  const songPostsData = [
    {
      id: 1,
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      description: 'Love this vibe',
      link: 'https://www.deezer.com/track/854583192',
      deezerLink: 'https://www.deezer.com/track/854583192',
      deezerTrackId: '854583192',
      spotifyLink: 'spotify:track:0VjIj9H9t3oZVBqSTq3asv',
      appleMusicLink: 'https://music.apple.com/fr/album/blinding-lights/1499385848?i=1499385861',
      youtubeLink: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/424354c414c5b364177b0d77f8674d81/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:00:00.000Z',
      userId: 1
    },
    {
      id: 2,
      title: 'Flowers',
      artist: 'Miley Cyrus',
      description: 'Self-love anthem',
      link: 'https://www.deezer.com/track/2056241037',
      deezerLink: 'https://www.deezer.com/track/2056241037',
      deezerTrackId: '2056241037',
      spotifyLink: 'spotify:track:0y9u9868f0oV3i7xO5M9uN',
      appleMusicLink: 'https://music.apple.com/fr/album/flowers/1664157777?i=1664157778',
      youtubeLink: 'https://music.youtube.com/watch?v=G7KNmW9a75Y',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/373981882d92c73229b48b26f5e8840e/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:05:00.000Z',
      userId: 2
    },
    {
      id: 3,
      title: 'As It Was',
      artist: 'Harry Styles',
      description: 'Classic',
      link: 'https://www.deezer.com/track/1716940827',
      deezerLink: 'https://www.deezer.com/track/1716940827',
      deezerTrackId: '1716940827',
      spotifyLink: 'spotify:track:4D75mtSgramDC3q6YtIAn9',
      appleMusicLink: 'https://music.apple.com/fr/album/as-it-was/1615555989?i=1615555995',
      youtubeLink: 'https://music.youtube.com/watch?v=H5v3kku4y6Q',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/31206d217983c2765313a30221375993/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:10:00.000Z',
      userId: 4
    },
    {
      id: 4,
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      description: "It's me, hi",
      link: 'https://www.deezer.com/track/1969032017',
      deezerLink: 'https://www.deezer.com/track/1969032017',
      deezerTrackId: '1969032017',
      spotifyLink: 'spotify:track:0V3wN9L9P9p6oGfG3asv',
      appleMusicLink: 'https://music.apple.com/fr/album/anti-hero/1644102459?i=1644102462',
      youtubeLink: 'https://music.youtube.com/watch?v=b1kbL3V0G74',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/4333b8a1c62f267a13d80360a8664168/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:15:00.000Z',
      userId: 5
    },
    {
      id: 5,
      title: 'Starboy',
      artist: 'The Weeknd',
      description: 'Looking at my phone',
      link: 'https://www.deezer.com/track/135118550',
      deezerLink: 'https://www.deezer.com/track/135118550',
      deezerTrackId: '135118550',
      spotifyLink: 'spotify:track:7fBv7CLKzip3STMs69O99C',
      appleMusicLink: 'https://music.apple.com/fr/album/starboy/1156443950?i=1156444007',
      youtubeLink: 'https://music.youtube.com/watch?v=34Na4j8AVgA',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/373981882d92c73229b48b26f5e8840e/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:20:00.000Z',
      userId: 3
    },
    {
      id: 6,
      title: 'Stay',
      artist: 'The Kid LAROI',
      description: 'I need you to stay',
      link: 'https://www.deezer.com/track/1406833502',
      deezerLink: 'https://www.deezer.com/track/1406833502',
      deezerTrackId: '1406833502',
      spotifyLink: 'spotify:track:5HCyWvS6ZOSIqdTVvCc02S',
      appleMusicLink: 'https://music.apple.com/fr/album/stay/1574379021?i=1574379022',
      youtubeLink: 'https://music.youtube.com/watch?v=kTJczUoc26U',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/786a87702816f164295f782c53027b4e/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:25:00.000Z',
      userId: 4
    },
    {
      id: 7,
      title: 'Heat Waves',
      artist: 'Glass Animals',
      description: 'Late nights in the middle of June',
      link: 'https://www.deezer.com/track/1007328002',
      deezerLink: 'https://www.deezer.com/track/1007328002',
      deezerTrackId: '1007328002',
      spotifyLink: 'spotify:track:0VjIj9H9t3oZVBqSTq3asv',
      appleMusicLink: 'https://music.apple.com/fr/album/heat-waves/1500331045?i=1500331046',
      youtubeLink: 'https://music.youtube.com/watch?v=mRD0-GxqHVo',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/31206d217983c2765313a30221375993/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:30:00.000Z',
      userId: 2
    },
    {
      id: 8,
      title: 'Bad Habits',
      artist: 'Ed Sheeran',
      description: 'My bad habits lead to you',
      link: 'https://www.deezer.com/track/1409355152',
      deezerLink: 'https://www.deezer.com/track/1409355152',
      deezerTrackId: '1409355152',
      spotifyLink: 'spotify:track:37SKSB6p89mC7X1S9K5HIn',
      appleMusicLink: 'https://music.apple.com/fr/album/bad-habits/1572940243?i=1572940244',
      youtubeLink: 'https://music.youtube.com/watch?v=orJSJGHjBLI',
      coverUrl:
        'https://e-cdns-images.dzcdn.net/images/cover/61664c126601b333ccf965d064d7df67/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T10:35:00.000Z',
      userId: 5
    },
    {
      id: 9,
      title: 'poussette',
      artist: 'Colin',
      description: null,
      link: 'https://www.deezer.com/track/2464492695',
      deezerLink: 'https://www.deezer.com/search/Colin%20poussette',
      deezerTrackId: '2464492695',
      spotifyLink: 'https://open.spotify.com/search/Colin%20poussette',
      appleMusicLink: 'https://music.apple.com/search?term=Colin%20poussette',
      youtubeLink: 'https://music.youtube.com/search?q=Colin%20poussette',
      coverUrl: 'https://cdn-images.dzcdn.net/images/cover/99fa9079dcfc8cb197ef838ff9f6c3c9/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T11:13:34.782Z',
      userId: 1
    },
    {
      id: 10,
      title: 'Toi et moi',
      artist: 'Jul',
      description: null,
      link: 'https://www.deezer.com/track/3484547261',
      deezerLink: 'https://www.deezer.com/track/3484547261',
      deezerTrackId: '3484547261',
      spotifyLink: 'spotify:track:6D8pnA3WyMrGy8Q2258BC0',
      appleMusicLink:
        'music://itunes.apple.com/fr/album/_/1830002880?i=1830003172&mt=1&app=music&ls=1&at=1000lHKX&ct=api_uri_m&itscg=30200&itsct=odsl_m',
      youtubeLink: 'https://music.youtube.com/watch?v=VrFXwZoKGCg',
      coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d169d748456254fd2c24e88122401c14/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T11:14:09.902Z',
      userId: 3
    },
    {
      id: 11,
      title: "On l'a fait",
      artist: '375Marty',
      description: null,
      link: 'https://www.deezer.com/track/2743805851',
      deezerLink: 'https://www.deezer.com/track/2743805851',
      deezerTrackId: '2743805851',
      spotifyLink: 'spotify:track:5ikzrbAKrfKXNex3CddjPK',
      appleMusicLink:
        'music://itunes.apple.com/fr/album/_/1740304257?i=1740304665&mt=1&app=music&ls=1&at=1000lHKX&ct=api_uri_m&itscg=30200&itsct=odsl_m',
      youtubeLink: 'https://music.youtube.com/watch?v=EmBWWUL7jGM',
      coverUrl: 'https://cdn-images.dzcdn.net/images/cover/5238798fbca8ae38e31cc25d40ddb749/250x250-000000-80-0-0.jpg',
      date: '2025-12-29T11:17:54.356Z',
      userId: 2
    }
  ]
  for (const post of songPostsData) {
    await prisma.songPost.create({
      data: {
        id: post.id,
        title: post.title,
        artist: post.artist,
        description: post.description,
        link: post.link,
        deezerLink: post.deezerLink,
        deezerTrackId: post.deezerTrackId,
        spotifyLink: post.spotifyLink,
        appleMusicLink: post.appleMusicLink,
        youtubeLink: post.youtubeLink,
        coverUrl: post.coverUrl,
        date: new Date(post.date),
        userId: post.userId
      }
    })
  }
  console.log('Created ' + songPostsData.length + ' song posts')

  // Create friendships
  const friendshipsData = [
    {
      id: 1,
      userId: 1,
      friendId: 2
    },
    {
      id: 2,
      userId: 1,
      friendId: 3
    },
    {
      id: 3,
      userId: 1,
      friendId: 4
    },
    {
      id: 4,
      userId: 2,
      friendId: 1
    },
    {
      id: 5,
      userId: 2,
      friendId: 5
    },
    {
      id: 6,
      userId: 3,
      friendId: 1
    },
    {
      id: 7,
      userId: 4,
      friendId: 1
    },
    {
      id: 8,
      userId: 4,
      friendId: 5
    },
    {
      id: 9,
      userId: 5,
      friendId: 2
    },
    {
      id: 10,
      userId: 5,
      friendId: 4
    }
  ]
  await prisma.friendship.createMany({
    data: friendshipsData.map((f) => ({
      id: f.id,
      userId: f.userId,
      friendId: f.friendId
    }))
  })
  console.log('Created ' + friendshipsData.length + ' friendships')

  // Create device tokens
  const deviceTokensData: any[] = []
  await prisma.deviceToken.createMany({
    data: deviceTokensData.map((t) => ({
      id: t.id,
      userId: t.userId,
      token: t.token,
      platform: t.platform,
      createdAt: new Date(t.createdAt)
    }))
  })
  console.log('Created ' + deviceTokensData.length + ' device tokens')

  // Create saves
  const savesData = [
    {
      id: 1,
      userId: 2,
      songPostId: 10,
      createdAt: '2025-12-29T11:32:01.472Z'
    },
    {
      id: 2,
      userId: 2,
      songPostId: 9,
      createdAt: '2025-12-29T11:44:38.638Z'
    },
    {
      id: 3,
      userId: 1,
      songPostId: 2,
      createdAt: '2025-12-29T11:50:00.000Z'
    },
    {
      id: 4,
      userId: 3,
      songPostId: 4,
      createdAt: '2025-12-29T11:55:00.000Z'
    },
    {
      id: 5,
      userId: 4,
      songPostId: 1,
      createdAt: '2025-12-29T12:00:00.000Z'
    },
    {
      id: 6,
      userId: 5,
      songPostId: 3,
      createdAt: '2025-12-29T12:05:00.000Z'
    },
    {
      id: 7,
      userId: 1,
      songPostId: 11,
      createdAt: '2025-12-29T12:10:00.000Z'
    },
    {
      id: 8,
      userId: 2,
      songPostId: 5,
      createdAt: '2025-12-29T12:15:00.000Z'
    }
  ]
  await prisma.save.createMany({
    data: savesData.map((s) => ({
      id: s.id,
      userId: s.userId,
      songPostId: s.songPostId,
      createdAt: new Date(s.createdAt)
    }))
  })
  console.log('Created ' + savesData.length + ' saves')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
