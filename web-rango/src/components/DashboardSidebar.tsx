import { 
  Home, 
  Truck, 
  ShoppingBag, 
  UtensilsCrossed, 
  Star, 
  FolderOpen,
  Package,
  Clock,
  MapPin,
  CreditCard,
  Tag,
  Settings,
  User
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Início", icon: Home, url: "/dashboard", badge: null },
  { title: "Delivery", icon: Truck, url: "/dashboard/delivery", badge: null },
  { title: "Pedidos", icon: ShoppingBag, url: "/dashboard/orders", badge: null },
  { title: "Cardápio", icon: UtensilsCrossed, url: "/dashboard/menu", badge: null },
  { title: "Avaliações", icon: Star, url: "/dashboard/reviews", badge: null },
  { title: "Catálogo", icon: FolderOpen, url: "/dashboard/catalog", badge: null },
  { title: "Logística", icon: Package, url: "/dashboard/logistics", badge: "Novo" },
  { title: "Tempo de entrega", icon: Clock, url: "/dashboard/delivery-time", badge: null },
  { title: "Área de entrega", icon: MapPin, url: "/dashboard/delivery-area", badge: null },
  { title: "Tempo de pagamento", icon: CreditCard, url: "/dashboard/payment-time", badge: null },
  { title: "Promoções", icon: Tag, url: "/dashboard/promotions", badge: null },
  { title: "Serviços", icon: Settings, url: "/dashboard/services", badge: null },
  { title: "Perfil", icon: User, url: "/dashboard/profile", badge: null },
];

export function DashboardSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary italic">ifood</span>
          </div>
          {open && (
            <p className="text-xs text-muted-foreground mt-1">Painel Giga Loja</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-sidebar-accent"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
