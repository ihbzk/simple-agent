import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const prestations = tool(
  async ({ categorie, ville, specialite }) => {
    try {
      // Construction de l'URL avec les paramètres de filtrage
      let url = "http://localhost:3000/api/prestations/";
      const params = new URLSearchParams();
      
      if (categorie) params.append('categorie', categorie);
      if (ville) params.append('city', ville);
      if (specialite) params.append('specialite', specialite);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log(`🔍 Recherche de prestations: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return `❌ Aucune prestation trouvée pour les critères spécifiés.`;
        }
        throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Gestion du format de réponse {success: true, data: [...]}
      const data = responseData.data || responseData;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return `❌ Aucune prestation disponible pour les critères: ${categorie ? `catégorie=${categorie}` : ''} ${ville ? `ville=${ville}` : ''} ${specialite ? `spécialité=${specialite}` : ''}`;
      }
      
      // Formatage des résultats selon la structure JSON réelle
      const results = data.map((prestation: any) => ({
        id: prestation.id,
        titre: prestation.title,
        description: prestation.description,
        telephone: prestation.phone,
        adresse: prestation.address,
        ville: prestation.city,
        codePostal: prestation.postalCode,
        services: prestation.services || [],
        specialites: prestation.specialties || [],
        tarif: prestation.pricing ? `${prestation.pricing}€` : 'Non spécifié',
        disponibilite: prestation.availability || 'Non spécifiée',
        note: prestation.rating || 0,
        nombreAvis: prestation.reviewCount || 0,
        actif: prestation.isActive,
        prestataire: {
          nom: prestation.user?.name || 'Non spécifié',
          email: prestation.user?.email || 'Non spécifié'
        }
      }));
      
      return {
        message: `✅ ${results.length} prestation(s) trouvée(s)`,
        prestations: results,
        total: results.length
      };
      
    } catch (error) {
      console.error('Erreur prestations:', error);
      return `❌ Impossible de récupérer les prestations. Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }
  },
  {
    name: "prestations",
    description: "Recherche et récupère des prestations depuis l'API en fonction de critères (catégorie, ville, spécialité)",
    schema: z.object({
      categorie: z.string().optional().describe("La catégorie de prestation (ex: santé, beauté, formation, restauration, etc.)"),
      ville: z.string().optional().describe("La ville où chercher des prestations"),
      specialite: z.string().optional().describe("La spécialité ou type de service recherché"),
    }),
  }
); 