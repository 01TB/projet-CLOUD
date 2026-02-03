package web.backend.project.utils;

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;

public class GeometryUtils {

    private static final WKTWriter wktWriter = new WKTWriter();
    private static final WKTReader wktReader = new WKTReader();

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
        return wktWriter.write(geometry);
    }

    /**
     * Convertit un WKT (Well-Known Text) en Geometry
     *
     * @param wkt la chaîne WKT à convertir
     * @return l'objet Geometry, ou null si wkt est null
     * @throws RuntimeException si le format WKT est invalide
     */
    public static Geometry wktToGeometry(String wkt) {
        if (wkt == null || wkt.trim().isEmpty()) {
            return null;
        }
        try {
            return wktReader.read(wkt);
        } catch (ParseException e) {
            throw new RuntimeException("Invalid WKT format: " + wkt, e);
        }
    }
}
