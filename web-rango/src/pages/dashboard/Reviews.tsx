import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Package,
  Clock,
  Utensils,
  Truck,
  ShieldCheck,
  Gift,
  Filter,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: Date;
  orderItems: string[];
  responded: boolean;
  response?: string;
  helpful: number;
  hasPhoto: boolean;
  aspects: {
    food: number;
    packaging: number;
    delivery: number;
    quantity: number;
  };
}

const Reviews = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'photos'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [reviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Carlos Silva',
      rating: 5,
      comment: 'Comida excelente! Chegou quentinha e a embalagem estava perfeita. Super recomendo!',
      date: new Date('2024-03-10'),
      orderItems: ['X-Burger Especial', 'Batata Frita'],
      responded: true,
      response: 'Muito obrigado pelo feedback! Ficamos felizes que tenha gostado! 😊',
      helpful: 12,
      hasPhoto: true,
      aspects: { food: 5, packaging: 5, delivery: 5, quantity: 5 },
    },
    {
      id: '2',
      customerName: 'Ana Santos',
      rating: 4,
      comment: 'Muito bom, mas demorou um pouco mais que o esperado. No mais, tudo ótimo!',
      date: new Date('2024-03-09'),
      orderItems: ['Pizza Margherita'],
      responded: false,
      helpful: 8,
      hasPhoto: false,
      aspects: { food: 5, packaging: 4, delivery: 3, quantity: 4 },
    },
    {
      id: '3',
      customerName: 'Pedro Oliveira',
      rating: 5,
      comment: 'Perfeito! Sempre peço aqui e nunca decepciona. Qualidade top!',
      date: new Date('2024-03-08'),
      orderItems: ['X-Bacon', 'Coca-Cola'],
      responded: true,
      response: 'Obrigado pela fidelidade, Pedro! Você é demais! 🎉',
      helpful: 15,
      hasPhoto: true,
      aspects: { food: 5, packaging: 5, delivery: 5, quantity: 5 },
    },
    {
      id: '4',
      customerName: 'Maria Costa',
      rating: 3,
      comment: 'Bom, mas a quantidade poderia ser um pouco maior pelo preço.',
      date: new Date('2024-03-07'),
      orderItems: ['Salada Caesar'],
      responded: false,
      helpful: 3,
      hasPhoto: false,
      aspects: { food: 4, packaging: 4, delivery: 4, quantity: 2 },
    },
    {
      id: '5',
      customerName: 'João Ferreira',
      rating: 5,
      comment: 'Simplesmente perfeito! Melhor hambúrguer da região!',
      date: new Date('2024-03-06'),
      orderItems: ['X-Burger Especial'],
      responded: false,
      helpful: 20,
      hasPhoto: true,
      aspects: { food: 5, packaging: 5, delivery: 5, quantity: 5 },
    },
  ]);

  // Estatísticas
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = (count / totalReviews) * 100;
    return { stars, count, percentage };
  });

  const aspectsAverage = {
    food: reviews.reduce((sum, r) => sum + r.aspects.food, 0) / reviews.length,
    packaging: reviews.reduce((sum, r) => sum + r.aspects.packaging, 0) / reviews.length,
    delivery: reviews.reduce((sum, r) => sum + r.aspects.delivery, 0) / reviews.length,
    quantity: reviews.reduce((sum, r) => sum + r.aspects.quantity, 0) / reviews.length,
  };

  const pendingResponses = reviews.filter((r) => !r.responded).length;

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'pending') return !review.responded;
    if (filter === 'responded') return review.responded;
    if (filter === 'photos') return review.hasPhoto;
    return true;
  });

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    toast({
      title: '✅ Resposta enviada!',
      description: 'Sua resposta foi publicada com sucesso.',
    });

    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o feedback dos seus clientes
          </p>
        </div>
        {pendingResponses > 0 && (
          <Badge variant="destructive" className="text-base px-4 py-2">
            {pendingResponses} pendente{pendingResponses > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="performance" className="gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Desempenho
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Avaliações a comentar
            {pendingResponses > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingResponses}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Desempenho */}
        <TabsContent value="performance" className="space-y-6">
          {/* Sobre a Loja */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Sobre a loja</CardTitle>
              <CardDescription className="text-base">
                Nos últimos 90 dias, sua loja teve{' '}
                <strong className="text-foreground">{totalReviews} avaliações</strong> publicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rating Geral */}
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        {renderStars(Math.round(averageRating), 'lg')}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {totalReviews} avaliações
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-20">
                            {renderStars(stars, 'sm')}
                          </div>
                          <Badge variant="secondary" className="w-12 justify-center">
                            {count}
                          </Badge>
                          <Progress value={percentage} className="h-2 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ilustração */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                      <Star className="h-24 w-24 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-4 shadow-lg">
                      <ThumbsUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sobre seus itens */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Sobre seus itens que foram entregues</CardTitle>
              <CardDescription className="text-base">
                O que seus clientes mais elogiam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Comida saborosa</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round((aspectsAverage.food / 5) * 100)}%
                      </span>
                    </div>
                    <Progress value={(aspectsAverage.food / 5) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Boa embalagem</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round((aspectsAverage.packaging / 5) * 100)}%
                      </span>
                    </div>
                    <Progress value={(aspectsAverage.packaging / 5) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Boa quantidade</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round((aspectsAverage.quantity / 5) * 100)}%
                      </span>
                    </div>
                    <Progress value={(aspectsAverage.quantity / 5) * 100} className="h-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Entrega rápida</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round((aspectsAverage.delivery / 5) * 100)}%
                      </span>
                    </div>
                    <Progress value={(aspectsAverage.delivery / 5) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">Pontualidade</span>
                      </div>
                      <span className="text-sm font-semibold">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-teal-600" />
                        <span className="font-medium">Item conforme</span>
                      </div>
                      <span className="text-sm font-semibold">97%</span>
                    </div>
                    <Progress value={97} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Avaliações a comentar */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Avaliações Individuais */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Avaliações</CardTitle>
                  <CardDescription className="text-base">
                    {filteredReviews.length} avaliação{filteredReviews.length !== 1 ? 'ões' : ''}{' '}
                    encontrada{filteredReviews.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">
                        Pendentes ({reviews.filter((r) => !r.responded).length})
                      </SelectItem>
                      <SelectItem value="responded">Respondidas</SelectItem>
                      <SelectItem value="photos">Com fotos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-6 border-2 rounded-lg hover:shadow-md transition-shadow space-y-4"
                >
                  {/* Header da Avaliação */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {review.customerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{review.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('pt-BR')} •{' '}
                            {review.orderItems.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <Badge variant="outline" className="ml-2">
                        {review.rating}.0
                      </Badge>
                    </div>
                  </div>

                  {/* Comentário */}
                  <p className="text-base leading-relaxed pl-13">{review.comment}</p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 pl-13">
                    {review.hasPhoto && (
                      <Badge variant="secondary" className="gap-1">
                        📷 Com foto
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {review.helpful} úteis
                    </Badge>
                  </div>

                  {/* Resposta ou Campo de Resposta */}
                  {review.responded && review.response ? (
                    <div className="pl-13 pt-4 border-l-4 border-primary/30 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-r-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary mb-1">
                            Resposta da loja
                          </p>
                          <p className="text-sm">{review.response}</p>
                        </div>
                        <Badge variant="default">Respondida</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-13 space-y-3">
                      {replyingTo === review.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escreva sua resposta..."
                            className="min-h-24"
                          />
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleReply(review.id)} size="sm">
                              Publicar Resposta
                            </Button>
                            <Button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setReplyingTo(review.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Responder avaliação
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma avaliação encontrada com este filtro</p>
                </div>
              )}
            </CardContent>
          </Card>
                </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reviews;
