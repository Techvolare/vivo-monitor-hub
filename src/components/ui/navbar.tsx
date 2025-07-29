import { LogOut, Home, Search, Shield } from "lucide-react";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";
import vivoLogo from "@/assets/vivo-logo.png";

interface NavbarProps {
  onLogout?: () => void;
  isAdmin?: boolean;
}

export const Navbar = ({ onLogout, isAdmin }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={vivoLogo} 
              alt="Vivo" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-foreground">
              Monitor Hub
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/consulta')}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Consulta</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Administração</span>
            </Button>
            
            {isAdmin && onLogout && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};