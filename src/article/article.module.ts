import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './entities/article.entity';
import { Provider, ProviderSchema } from 'src/provider/entities/provider.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      // Used by ArticleService for a manual, cast-safe fournisseur lookup
      // that tolerates legacy rows where fournisseur is a non-ObjectId string.
      { name: Provider.name, schema: ProviderSchema },
    ]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
