import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface CategoryProps {
  category: {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
  };
}

const CategoryCard = ({ category }: CategoryProps) => {
  const router = useRouter();

  return (
    <Card 
      sx={{ 
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 3,
        },
      }}
    >
      <CardActionArea 
        onClick={() => router.push(`/categories/${category.id}`)}
        sx={{ height: "100%" }}
      >
        <CardMedia
          component="img"
          height="200"
          image={category.imageUrl}
          alt={category.name}
          sx={{
            objectFit: "cover",
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h2">
            {category.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {category.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard; 