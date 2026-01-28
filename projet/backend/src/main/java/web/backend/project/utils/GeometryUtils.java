package web.backend.project.utils;


import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.WKTWriter;

public class GeometryUtils {

    /**
     * Convertit une Geometry en WKT (Well-Known Text)
     *
     * @param geometry l'objet Geometry à convertir
     * @return la représentation WKT, ou null si geometry est null
     */
    public static String geometryToWKT(Geometry geometry) {
        if (geometry == null) {
            return null;
        }

        WKTWriter writer = new WKTWriter();
        return writer.write(geometry);
    }
}
