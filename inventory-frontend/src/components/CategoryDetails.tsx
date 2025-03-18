import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryDetailsProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryDetails({
  category,
  isOpen,
  onClose,
}: CategoryDetailsProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            {category.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}