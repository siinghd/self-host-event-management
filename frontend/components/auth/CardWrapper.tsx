import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footerContent?: React.ReactNode;
}

const CardWrapper = ({
  children,
  title,
  description,
  footerContent,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footerContent && <CardFooter>{footerContent}</CardFooter>}
    </Card>
  );
};

export default CardWrapper;
