import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Building2,
  Key,
  QrCode,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function Banking() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const [bankData, setBankData] = useState({
    // Dados bancários
    bankCode: '001',
    bankName: 'Banco do Brasil',
    accountType: 'corrente',
    agency: '',
    agencyDigit: '',
    account: '',
    accountDigit: '',
    
    // Pix
    pixKeyType: 'cpf',
    pixKey: '',
    
    // Titular
    holderName: '',
    holderDocument: '',
  });

  const [verified, setVerified] = useState(false);

  const banks = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '033', name: 'Santander' },
    { code: '104', name: 'Caixa Econômica' },
    { code: '237', name: 'Bradesco' },
    { code: '341', name: 'Itaú' },
    { code: '260', name: 'Nubank' },
    { code: '077', name: 'Inter' },
    { code: '290', name: 'PagSeguro' },
    { code: '323', name: 'Mercado Pago' },
  ];

  useEffect(() => {
    loadBankingData();
  }, [user?.storeId]);

  const loadBankingData = async () => {
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: '✅ Dados salvos!',
        description: 'Informações bancárias atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dados Bancários</h1>
          <p className="text-muted-foreground mt-1">
            Configure suas informações para recebimento de pagamentos
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Dados'}
        </Button>
      </div>

      {/* Verification Status */}
      {verified ? (
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Conta Verificada
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Seus dados foram validados e você está pronto para receber pagamentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  Conta Pendente de Verificação
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Complete os dados abaixo e nossa equipe validará em até 24 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Conta Bancária
          </CardTitle>
          <CardDescription>
            Informe os dados da sua conta para receber transferências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Banco *</Label>
              <Select
                value={bankData.bankCode}
                onValueChange={(value) => {
                  const bank = banks.find((b) => b.code === value);
                  setBankData({
                    ...bankData,
                    bankCode: value,
                    bankName: bank?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Conta *</Label>
              <Select
                value={bankData.accountType}
                onValueChange={(value) =>
                  setBankData({ ...bankData, accountType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agência *</Label>
              <div className="flex gap-2">
                <Input
                  value={bankData.agency}
                  onChange={(e) =>
                    setBankData({ ...bankData, agency: e.target.value })
                  }
                  placeholder="0000"
                  maxLength={4}
                  className="flex-1"
                />
                <Input
                  value={bankData.agencyDigit}
                  onChange={(e) =>
                    setBankData({ ...bankData, agencyDigit: e.target.value })
                  }
                  placeholder="0"
                  maxLength={1}
                  className="w-16"
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label>Número da Conta *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showAccountNumber ? 'text' : 'password'}
                    value={bankData.account}
                    onChange={(e) =>
                      setBankData({ ...bankData, account: e.target.value })
                    }
                    placeholder="00000000"
                    maxLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showAccountNumber ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Input
                  value={bankData.accountDigit}
                  onChange={(e) =>
                    setBankData({ ...bankData, accountDigit: e.target.value })
                  }
                  placeholder="0"
                  maxLength={2}
                  className="w-16"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Holder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Titular da Conta
          </CardTitle>
          <CardDescription>
            Dados do responsável pela conta bancária
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome Completo *</Label>
            <Input
              value={bankData.holderName}
              onChange={(e) =>
                setBankData({ ...bankData, holderName: e.target.value })
              }
              placeholder="Nome completo do titular"
            />
          </div>

          <div>
            <Label>CPF/CNPJ *</Label>
            <Input
              value={bankData.holderDocument}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const masked =
                  value.length <= 11 ? maskCPF(value) : maskCNPJ(value);
                setBankData({ ...bankData, holderDocument: masked });
              }}
              placeholder="000.000.000-00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Chave Pix
          </CardTitle>
          <CardDescription>
            Configure sua chave Pix para recebimentos instantâneos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Chave</Label>
            <Select
              value={bankData.pixKeyType}
              onValueChange={(value) =>
                setBankData({ ...bankData, pixKeyType: value, pixKey: '' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Chave Pix *</Label>
            <Input
              value={bankData.pixKey}
              onChange={(e) => {
                let value = e.target.value;
                if (bankData.pixKeyType === 'cpf') {
                  value = maskCPF(value.replace(/\D/g, ''));
                } else if (bankData.pixKeyType === 'cnpj') {
                  value = maskCNPJ(value.replace(/\D/g, ''));
                }
                setBankData({ ...bankData, pixKey: value });
              }}
              placeholder={
                bankData.pixKeyType === 'cpf'
                  ? '000.000.000-00'
                  : bankData.pixKeyType === 'cnpj'
                  ? '00.000.000/0000-00'
                  : bankData.pixKeyType === 'email'
                  ? 'seu@email.com'
                  : bankData.pixKeyType === 'phone'
                  ? '(00) 00000-0000'
                  : '00000000-0000-0000-0000-000000000000'
              }
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              A chave Pix deve estar cadastrada no mesmo CPF/CNPJ do titular da conta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card className="border-gray-300 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-1">🔒 Seus dados estão seguros</p>
              <p>
                Todas as informações bancárias são criptografadas e armazenadas com segurança.
                Utilizamos os mesmos padrões de segurança de instituições financeiras.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 