import { Injectable } from '@nestjs/common';
import { NewsletterSubscriber } from './modules/newsletter/entity/newsletter-subscriber.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async subscribeToOffers(nome: string, email: string): Promise<void> {
    const normalizedName = nome.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await NewsletterSubscriber.findOneBy({
      email: normalizedEmail,
    });
    const subscriber = existing ?? NewsletterSubscriber.create();
    subscriber.nome = normalizedName;
    subscriber.email = normalizedEmail;
    await subscriber.save();
  }
}
