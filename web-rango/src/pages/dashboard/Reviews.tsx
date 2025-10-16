import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  response?: string;
  helpful: number;
  createdAt: any;
  updatedAt: any;
}

interface ReviewStats {
  average: number;
  count: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.storeId) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    if (!user?.storeId) return;

    try {
      setLoading(true);
      
      // SOLUÇÃO TEMPORÁRIA: Removendo orderBy para evitar erro de índice
      const q = query(
        collection(db, 'reviews'),
        where('storeId', '==', user.storeId)
        // orderBy('createdAt', 'desc') // Descomentar após deploy do índice
      );

      const snapshot = await getDocs(q);
      const reviewsData: Review[] = [];

      snapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() } as Review);
      });

      // Ordenar no JavaScript (solução temporária)
      const sortedReviews = reviewsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setReviews(sortedReviews);
      calculateStats(sortedReviews);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviewsData.length;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    setStats({
      average: Math.round(average * 10) / 10,
      count: reviewsData.length,
      distribution,
    });
  };

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim() || responseText.trim().length < 5) {
      alert('A resposta deve ter pelo menos 5 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        response: responseText.trim(),
        updatedAt: serverTimestamp(),
      });

      // Atualizar localmente
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, response: responseText.trim() } : r
        )
      );

      setRespondingTo(null);
      setResponseText('');
      alert('Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderDistributionBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div key={stars} className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 w-8">{stars}★</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
      </div>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e responda às avaliações dos clientes
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo Geral */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Avaliação Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.average.toFixed(1)}
              </div>
              {renderStars(stats.average)}
              <p className="text-sm text-gray-500 mt-2">
                Baseado em {stats.count} {stats.count === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) =>
              renderDistributionBar(stars, stats.distribution[stars as keyof typeof stats.distribution], stats.count)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Avaliações ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                Nenhuma avaliação ainda
              </p>
              <p className="text-gray-400 text-sm mt-1">
                As avaliações dos clientes aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-6 divide-y">
              {reviews.map((review) => (
                <div key={review.id} className="pt-6 first:pt-0">
                  {/* Cabeçalho */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {review.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {/* Comentário */}
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Pedido ID */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      Pedido #{review.orderId.slice(-6).toUpperCase()}
                    </Badge>
                    {review.helpful > 0 && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {review.helpful}
                      </Badge>
                    )}
                  </div>

                  {/* Resposta Existente */}
                  {review.response && (
                    <Alert className="bg-red-50 border-red-200">
                      <MessageSquare className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <p className="text-sm font-medium text-red-900 mb-1">
                          Sua resposta:
                        </p>
                        <p className="text-sm text-red-800">{review.response}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Formulário de Resposta */}
                  {!review.response && (
                    <>
                      {respondingTo === review.id ? (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <Textarea
                            placeholder="Digite sua resposta..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRespond(review.id)}
                              disabled={submitting}
                              size="sm"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Resposta
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              disabled={submitting}
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRespondingTo(review.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Responder
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
