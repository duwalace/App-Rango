import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

interface ItemActionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemActionsMenu = ({ onEdit, onDelete }: ItemActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Edit className="h-4 w-4 mr-2" />
          Editar item
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDelete} 
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
