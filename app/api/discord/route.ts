// app/api/discord/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const CHANNEL_ID = '1395843955974869014';
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=10`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
      next: { revalidate: 60 } // Actualiza los datos cada 60 segundos
    });

    const data = await response.json();

    // Transformamos el formato de Discord al formato que usa tu componente
    const messages = data.map((msg: any) => ({
      id: msg.id,
      author: {
        username: msg.author.global_name || msg.author.username,
        avatar: msg.author.avatar 
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
          : "/placeholder.svg",
      },
      content: msg.content,
      timestamp: msg.timestamp,
      attachments: msg.attachments.map((att: any) => ({
        url: att.url,
        filename: att.filename,
      })),
    }));

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}