import { Badge } from "./ui/badge";
import { Box } from "~/lib/icons/Box";

export const ProductBoxSign = ({ isBox }: { isBox: boolean }) => <Badge variant="blue" className="ml-2"><Box size={20}
    strokeWidth={1.25} className="h-4 w-4 text-foreground" /></Badge>
